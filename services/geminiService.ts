// This file handles all interactions with the Google Gemini API.
import { GoogleGenAI, Type } from "@google/genai";
import { Message, Persona, PersonaFocus, ExtractedIdea } from '../types';
import { PERSONA_DEFINITIONS } from '../constants';
import { v4 as uuidv4 } from 'uuid';


// The API key is expected to be available in the environment variables.
const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

const getModelName = (isDeepDive: boolean, isFlash: boolean, isBigBossActive: boolean): string => {
    if (isFlash) {
        // "Yıldırım Hızı" (Flash Yanıt) modu için en hızlı model.
        return 'gemini-flash-lite-latest';
    }
    if (isDeepDive || isBigBossActive) {
        // "Ağır Siklet" (Derin Düşünce) ve kritik kararlar için en güçlü model.
        return 'gemini-2.5-pro';
    }
    // Varsayılan, dengeli motor. Normal ve Kısa Mod için ideal.
    return 'gemini-2.5-flash';
};

const buildPersonaInstructions = (personaFocus: PersonaFocus, isConcise: boolean, isDeepDive: boolean, bigBossInfluence: number): string => {
    return PERSONA_DEFINITIONS.map(p => {
        let instruction = p.systemInstruction;
        
        if (p.persona === Persona.Moderator) {
            if (bigBossInfluence > 0) {
                 if (bigBossInfluence > 75) {
                    instruction += `\nBig Boss'un etki seviyesi çok yüksek. Her 2-3 turda bir ondan görüş istemelisin.`;
                } else if (bigBossInfluence > 25) {
                    instruction += `\nBig Boss'un etki seviyesi orta düzeyde. Tartışmanın ortasında onun görüşünü al.`;
                } else {
                    instruction += `\nBig Boss'un etki seviyesi düşük. Sadece tartışmanın sonuna doğru veya bir fikir bulunduğunda ondan onay iste.`;
                }
            }
        }
        
        const focus = personaFocus[p.persona] || 'Default';
        if (focus === 'Leader') {
            instruction += '\nSen bu tartışmada lidersin. Daha detaylı ve yönlendirici ol.'
        }
        if (focus === 'Muted') {
            instruction = `Sen bu turda sessizsin. Sadece tek kelimelik bir cevap ver veya "..." de.`
        }
        if (isConcise) {
            instruction += '\nCevapların kısa ve öz olsun. En fazla 2-3 cümle kullan.';
        }
        if (isDeepDive) {
            instruction += '\nBu turda derinlemesine analiz yap. Fikrin her yönünü detaylıca ele al.';
        }
        return `${p.persona}: ${instruction}`;
    }).join('\n\n');
}

export const generateFullConversationScript = async (
    topic: string,
    personaFocus: PersonaFocus,
    isConcise: boolean,
    isDeepDive: boolean,
    isFlash: boolean,
    isBigBossActive: boolean,
    bigBossInfluence: number,
    mainFocusIdea?: string,
    vaultContents?: string,
): Promise<string> => {
    const modelName = getModelName(isDeepDive, isFlash, isBigBossActive);
    
    const personaInstructions = buildPersonaInstructions(personaFocus, isConcise, isDeepDive, isBigBossActive ? bigBossInfluence : 0);
    
    let systemInstruction = `Sen, birden fazla yapay zeka kişiliğini canlandıran bir metin oluşturucusun. Aşağıdaki kişiliklerin talimatlarına uyarak bir beyin fırtınası oturumu senaryosu oluşturacaksın.

### KİŞİLİKLER ###
${personaInstructions}

### GÖREV ###
Verilen konu üzerinde bir tartışma senaryosu oluştur. Her kişilik sırayla konuşmalıdır. Tartışma, yenilikçi ve niş bir iş fikri bulana kadar devam etmelidir. Fikir bulunduğunda, Moderatör "SANIRIM BİR FİKİR BULDUM!" diyerek tartışmayı bitirir ve ardından fikrin başlığını ve açıklamasını yazar. SON OLARAK, metnin sonuna özel bir belirteç olan "[FİKİR BULDUM]" ekle.`;
    
    if (isBigBossActive) {
        systemInstruction += `\n\n### ÖNEMLİ KURAL: BIG BOSS AKTİF ###\nEkip üyeleri Big Boss'u etkilemeye çalışmalıdır. Moderatör, Big Boss'un etki seviyesine göre uygun anlarda tartışmayı durdurmalı ve Big Boss'a "Big Boss, son söz sizin. Bu fikir hakkında ne düşünüyorsunuz?" diye sormalıdır. Ardından, metnin sonuna özel bir belirteç olan "[AWAITING_BOSS_INPUT]" ekleyerek senaryoyu DURDUR.`;
    }

    let userPrompt = `Yeni bir beyin fırtınası başlıyor. Lütfen aşağıdaki detaylara göre bir tartışma senaryosu oluştur.\n\nKonu: **${topic}**\n\n`;

    if (mainFocusIdea) {
        userPrompt += `ANA ODAK: ${mainFocusIdea}\n\n`;
    }
    if (vaultContents) {
        userPrompt += `KASADAKİ FİKİRLER (Bunları Tekrarlama): ${vaultContents}\n\n`;
    }
    
    userPrompt += "Senaryo şimdi başlasın. Her cevabı 'Kişilik: Cevap' formatında yaz."

    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: userPrompt,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.8,
                topP: 1,
            }
        });
        return response.text.trim();
    } catch (error) {
        console.error(`Error generating full script:`, error);
        return `Sistem: Üzgünüm, bir hata oluştu ve beyin fırtınası başlatılamadı.`;
    }
};

export const generatePersonaTurn = async (
    history: Message[],
    currentPersona: Persona,
    topic: string,
    personaFocus: PersonaFocus,
    isDeepDive: boolean,
    isBigBossActive: boolean,
    bigBossInfluence: number
): Promise<string> => {
    const personaDef = PERSONA_DEFINITIONS.find(p => p.persona === currentPersona);
    if (!personaDef) {
        return `Sistem: ${currentPersona} rolü için tanım bulunamadı.`;
    }

    let personaInstruction = personaDef.systemInstruction;
     if (currentPersona === Persona.Moderator && isBigBossActive) {
        if (bigBossInfluence > 75) {
            personaInstruction += `\nBig Boss'un etki seviyesi çok yüksek. Her 2-3 turda bir ondan görüş istemelisin.`;
        } else if (bigBossInfluence > 25) {
            personaInstruction += `\nBig Boss'un etki seviyesi orta düzeyde. Tartışmanın ortasında onun görüşünü al.`;
        } else {
            personaInstruction += `\nBig Boss'un etki seviyesi düşük. Sadece tartışmanın sonuna doğru veya bir fikir bulunduğunda ondan onay iste.`;
        }
    }

    const focus = personaFocus[personaDef.persona] || 'Default';

    if (focus === 'Leader') personaInstruction += '\nSen bu tartışmada lidersin. Daha detaylı ve yönlendirici ol.';
    if (focus === 'Muted') return Promise.resolve('...');
    if (isDeepDive) personaInstruction += '\nBu turda derinlemesine analiz yap. Fikrin her yönünü detaylıca ele al.';

    const systemInstruction = `Sen, bir beyin fırtınası oturumunda TEK BİR yapay zeka kişiliğini canlandırıyorsun. Sadece sana atanan rolü oyna ve diğer kişilikler hakkında yorum yapma.

### SENİN ROLÜN ###
${currentPersona}: ${personaInstruction}

### GÖREV ###
Aşağıdaki tartışma geçmişini ve ana konuyu dikkate alarak, SADECE ${currentPersona} olarak bir sonraki cevabı oluştur. Cevabın doğal bir konuşma akışında olmalı. Diğer kişiliklerin ne diyeceğini yazma. Sadece kendi sıranı oyna.`;

    let prompt = `Ana Konu: **${topic}**\n\n### TARTIŞMA GEÇMİŞİ ###\n`;
    prompt += history.map(msg => `${msg.sender}: ${msg.text}`).join('\n');
    prompt += `\n\nŞimdi sıra sende. ${currentPersona} olarak cevabını yaz:`;

    try {
        const modelName = getModelName(isDeepDive, false, isBigBossActive);
        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.7,
                topP: 1,
            }
        });
        return response.text.trim();
    } catch (error) {
        console.error(`Error generating turn for ${currentPersona}:`, error);
        return `Sistem: ${currentPersona} için yanıt oluşturulurken bir hata oluştu.`;
    }
};

export const summarizeAndExtractIdeas = async (history: Message[]): Promise<ExtractedIdea[]> => {
    const systemInstruction = `Sen bir beyin fırtınası analiz uzmanısın. Görevin, verilen tartışma metnini analiz ederek ortaya çıkan en iyi 3 ila 5 potansiyel iş fikrini belirlemektir. Her fikir için kısa, akılda kalıcı bir başlık ve tek cümlelik bir özet oluştur. Çıktıyı, her biri 'title' ve 'summary' alanları içeren bir JSON dizisi olarak formatla. Başka hiçbir metin ekleme, sadece JSON dizisini döndür.`;
    
    const prompt = `Lütfen aşağıdaki beyin fırtınası konuşmasını analiz et ve potansiyel iş fikirlerini çıkar:\n\n${history.map(m => `${m.sender}: ${m.text}`).join('\n')}`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.3,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            summary: { type: Type.STRING },
                        },
                        required: ["title", "summary"],
                    },
                },
            },
        });

        const jsonString = response.text.trim();
        const ideas: { title: string, summary: string }[] = JSON.parse(jsonString);
        
        return ideas.map(idea => ({ ...idea, id: uuidv4() }));

    } catch (error) {
        console.error('Error summarizing and extracting ideas:', error);
        return [];
    }
};

export const detailElicitedIdea = async (history: Message[], ideaToDetail: ExtractedIdea): Promise<string> => {
    const systemInstruction = `Sen bir iş stratejisi ve ürün yönetimi uzmanısın. Görevin, sana verilen bir beyin fırtınası geçmişi ve seçilen bir fikir özetinden yola çıkarak, bu fikir için detaylı bir konsept oluşturmaktır. Cevabını Markdown formatında, aşağıdaki başlıkları kullanarak yapılandır:

- **Konsept Özeti:** Fikri 2-3 cümleyle yeniden özetle.
- **Anahtar Özellikler:** Ürünün veya hizmetin en önemli 3-5 özelliğini listele.
- **Hedef Kitle:** Bu fikrin kimin sorununu çözdüğünü net bir şekilde tanımla.
- **Gelir Modeli:** Fikrin nasıl para kazanabileceğine dair 1-2 potansiyel yol öner.
- **Potansiyel Riskler:** Fikrin önündeki en büyük 2-3 engeli belirt.
- **İlk Adım (MVP):** Fikri hayata geçirmek için atılması gereken ilk somut adımı veya en basit ürün versiyonunu tanımla.`;

    const prompt = `Lütfen aşağıdaki beyin fırtınası konuşması ve seçilen fikri analiz ederek detaylı bir konsept oluştur.\n\n### TARTIŞMA GEÇMİŞİ ###\n${history.map(m => `${m.sender}: ${m.text}`).join('\n')}\n\n### DETAYLANDIRILACAK FİKİR ###\n**Başlık:** ${ideaToDetail.title}\n**Özet:** ${ideaToDetail.summary}`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.6,
            }
        });
        return response.text.trim();
    } catch (error) {
        console.error('Error detailing idea:', error);
        return "Fikir detaylandırılırken bir hata oluştu.";
    }
};


export const getRateLimitSummary = async (rateLimitDoc: string): Promise<string> => {
    const expert = PERSONA_DEFINITIONS.find(p => p.persona === Persona.HızSınırlarıUzmanı);
    if (!expert) return "Uzman tanımı bulunamadı.";

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: rateLimitDoc,
            config: {
                systemInstruction: expert.systemInstruction,
                temperature: 0.5,
            }
        });
        return response.text.trim();
    } catch (error) {
        console.error(`Error generating rate limit summary:`, error);
        return `Sistem: Hız limitleri özeti oluşturulurken bir hata oluştu. Lütfen daha sonra tekrar deneyin.`;
    }
};

export const generateInspirationTopics = async (): Promise<string[]> => {
    const systemInstruction = `Sen yaratıcı bir fikir küratörüsün. Görevin, teknoloji, toplum ve iş dünyasındaki güncel trendleri birleştirerek 3 adet yenilikçi ve ilgi çekici konu başlığı oluşturmaktır. Başlıklar kısa, öz ve beyin fırtınası için ilham verici olmalıdır. Cevabını sadece bir JSON dizisi olarak döndür. Örnek: ["Sürdürülebilir Kentsel Tarım", "Yapay Zeka Destekli Kişisel Gelişim", "Oyunlaştırılmış Finansal Okuryazarlık"]`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'Bana 3 adet ilham verici ve birleştirilebilir konu başlığı öner.',
            config: {
                systemInstruction,
                temperature: 0.9,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.STRING,
                    },
                },
            },
        });
        const jsonString = response.text.trim();
        const topics: string[] = JSON.parse(jsonString);
        return topics;
    } catch (error) {
        console.error('Error generating inspiration topics:', error);
        // Return fallback topics on error
        return ['Yapay Zeka Sanatı', 'Giyilebilir Sağlık Teknolojisi', 'Sanal Gerçeklikte Sosyal Etkileşim'];
    }
};