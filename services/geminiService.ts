// This file handles all interactions with the Google Gemini API.
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Message, Persona, PersonaFocus, ExtractedIdea } from '../types';
import { PERSONA_DEFINITIONS } from '../constants';


// The API key is expected to be available in the environment variables.
const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

const generateUniqueId = () => `id-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

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
    return PERSONA_DEFINITIONS.filter(p => p.persona !== Persona.Cerevo).map(p => {
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
        return `Sistem: Üzgünüm, ${currentPersona} rolü için bir yanıt oluşturulurken bir hata oluştu.`;
    }
};

export const getRateLimitSummary = async (documentation: string): Promise<string> => {
    const personaDef = PERSONA_DEFINITIONS.find(p => p.persona === Persona.HızSınırlarıUzmanı);
    if (!personaDef) return "Uzman tanımı bulunamadı.";

    const prompt = `Lütfen aşağıdaki API hız sınırı dokümantasyonunu analiz et ve ana noktaları özetle. Cevabını Markdown formatında, tablolar, listeler ve vurgular kullanarak yapılandır. Kullanıcının konuyu kolayca anlamasını sağla.\n\nDokümantasyon:\n${documentation}`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                systemInstruction: personaDef.systemInstruction
            }
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error getting rate limit summary:", error);
        return "Hız sınırı bilgileri alınırken bir hata oluştu.";
    }
};

export const summarizeAndExtractIdeas = async (history: Message[]): Promise<ExtractedIdea[]> => {
    const systemInstruction = `Sen, bir beyin fırtınası oturumunun sohbet geçmişini analiz eden bir yapay zeka asistanısın. Görevin, konuşma içinde geçen potansiyel iş fikirlerini belirlemek, her birine akılda kalıcı bir başlık vermek ve kısa bir özetini çıkarmaktır. Sonucu, belirtilen JSON şemasına uygun olarak döndür.`;
    const prompt = `Lütfen aşağıdaki sohbet geçmişini analiz et ve 1 ila 3 adet potansiyel iş fikri çıkar. Her fikir için bir başlık ve kısa bir özet oluştur.

### SOHBET GEÇMİŞİ ###
${history.map(msg => `${msg.sender}: ${msg.text}`).join('\n')}
`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: {
                                type: Type.STRING,
                                description: "Fikir için akılda kalıcı bir başlık."
                            },
                            summary: {
                                type: Type.STRING,
                                description: "Fikrin 1-2 cümlelik kısa özeti."
                            }
                        },
                        required: ["title", "summary"]
                    }
                }
            }
        });
        const ideas = JSON.parse(response.text);
        return ideas.map((idea: any) => ({ ...idea, id: generateUniqueId() }));
    } catch (error) {
        console.error("Error extracting ideas:", error);
        return [];
    }
};

export const detailElicitedIdea = async (history: Message[], idea: ExtractedIdea): Promise<string> => {
    const systemInstruction = `Sen, bir iş fikrini detaylandıran bir strateji uzmanısın. Sana verilen sohbet geçmişini ve ana fikir başlığını kullanarak, bu fikir için detaylı bir konsept oluştur. Cevabını Markdown formatında yapılandır. Başlıklar, listeler ve vurgular kullan. Ele alınacak konular: Hedef Kitle, Problem, Çözüm, Gelir Modeli ve Pazarlama Stratejisi.`;
    const prompt = `Lütfen aşağıdaki sohbet geçmişini ve ana fikri kullanarak detaylı bir iş konsepti oluştur.

### SOHBET GEÇMİŞİ ###
${history.map(msg => `${msg.sender}: ${msg.text}`).join('\n')}

### DETAYLANDIRILACAK FİKİR ###
Başlık: ${idea.title}
Özet: ${idea.summary}

Lütfen bu fikri aşağıdaki başlıklar altında detaylandır:
- **Hedef Kitle:**
- **Çözülen Problem:**
- **Sunulan Çözüm:**
- **Olası Gelir Modelleri:**
- **Pazarlama Stratejileri:**
`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
            }
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error detailing idea:", error);
        return "Fikir detaylandırılırken bir hata oluştu.";
    }
};

export const generateCerevoResponse = async (history: Message[]): Promise<string> => {
    const cerevoDef = PERSONA_DEFINITIONS.find(p => p.persona === Persona.Cerevo);
    if (!cerevoDef) return "Üzgünüm, şu an kendimi pek kendim gibi hissetmiyorum.";

    const prompt = `Aşağıdaki sohbet geçmişini dikkate alarak Cerevo olarak esprili ve zeki bir yanıt ver.

### SOHBET GEÇMİŞİ ###
${history.map(msg => `${msg.sender}: ${msg.text}`).join('\n')}

Cerevo:`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: cerevoDef.systemInstruction
            }
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error generating Cerevo response:", error);
        return "Beyin devrelerimde bir kısa devre oldu, bir saniye lütfen.";
    }
};

export const generateTopicImage = async (topic: string): Promise<string | null> => {
    const prompt = `Soyut, sanatsal, dijital sanat tarzında, koyu tonların ve neon renklerin hakim olduğu, "${topic}" konusunu anımsatan bir arka plan görseli. Minimalist ve estetik.`;
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '16:9',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            return response.generatedImages[0].image.imageBytes;
        }
        return null;
    } catch (error) {
        console.error("Error generating topic image:", error);
        // Rethrow the error to be handled in the component
        throw error;
    }
};
