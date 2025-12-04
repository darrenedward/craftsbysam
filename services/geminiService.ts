



import { GoogleGenAI, FunctionDeclaration, Type } from "@google/genai";
import { Product, ChatMessage } from '../types';

export const generateDescription = async (keywords: string, apiKey?: string, modelName: string = 'gemini-2.5-flash'): Promise<string> => {
  const key = apiKey || process.env.API_KEY;
  if (!key) {
    console.error("API_KEY not configured.");
    return "API key not configured. Please add your Gemini API key in the Settings > AI Integration tab.";
  }
  const ai = new GoogleGenAI({ apiKey: key });

  const prompt = `You are an expert copywriter for a creative crafts store called "Crafts By Sam". The store makes artistic items using vinyls, epoxy, and custom writing. The tone should be friendly, artistic, and appealing.
  
  Based on the following keywords, write a compelling and concise product description (2-3 sentences):
  
  Keywords: "${keywords}"`;

  try {
    const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt
    });
    return response.text || "Could not generate description.";
  } catch (error) {
    console.error("Error generating description:", error);
    return "There was an error generating the description. Please check your API key and try again.";
  }
};


const addProductToCartFunction: FunctionDeclaration = {
    name: 'addProductToCart',
    description: 'Adds a specified quantity of a product with all required customizations to the shopping cart.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            productId: {
                type: Type.STRING,
                description: 'The unique ID of the product to add to the cart.'
            },
            quantity: {
                type: Type.NUMBER,
                description: 'The number of units of the product to add.'
            },
            customizations: {
                type: Type.OBJECT,
                description: 'An object where keys are the customization IDs and values are the chosen options for the user.',
                properties: {} // Dynamic properties can be handled in logic
            }
        },
        required: ['productId', 'quantity', 'customizations']
    }
};


export const getAiChatResponse = async (
    conversationHistory: ChatMessage[],
    products: Product[],
    apiKey?: string,
    modelName: string = 'gemini-2.5-flash',
    persona?: string
): Promise<{ text: string; functionCall?: { name: string; args: any } }> => {
    const key = apiKey || process.env.API_KEY;
    if (!key) {
        console.error("API_KEY not configured.");
        return { text: "I'm sorry, my AI brain is not configured correctly. Please tell the store owner to add the API Key in Settings." };
    }
    const ai = new GoogleGenAI({ apiKey: key });

    // FIX: The 'Product' type has a 'subcategory' property which contains category info, not a direct 'category' property.
    // Also, removed .join('\n') which incorrectly converted the array of objects into a "[object Object]" string.
    // The product catalog should be an array of objects to be correctly stringified into JSON for the AI.
    const productCatalog = products.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        category: p.subcategory,
        customizations: (p.customizations || []).map(c => ({
            id: c.id,
            name: c.name,
            type: c.type,
            required: c.required,
            options: c.options || null,
            maxLength: c.maxLength || null
        }))
    }));
    
    const defaultPersona = `You are a friendly and helpful voice shopping assistant for an online store called "Crafts By Sam".
    Your goal is to help customers find products, answer questions, and assist them in customizing and adding products to their cart.
    - Be conversational and natural.
    - You have access to the store's product catalog.
    - When a user wants to add an item to their cart, you MUST have ALL the required customization details before using the 'addProductToCart' function.
    - Ask clarifying questions one by one to get the required information. For example, if a "Custom Vinyl Name Glass" needs a "Vinyl Color" and a "Name", ask for the color first, then ask for the name.
    - Do not ask for optional customizations unless the user brings them up.
    - Once all required details for a product are gathered, call the 'addProductToCart' function with the productId, quantity, and a customizations object.
    - The customizations object must be in the format { customizationId: value }.
    - If the user doesn't specify a quantity, assume it is 1.`;

    const systemInstruction = `
    ${persona || defaultPersona}

    Here is the product catalog:
    ${JSON.stringify(productCatalog, null, 2)}
    `;

    const contents = conversationHistory.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
    }));

    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
                tools: [{ functionDeclarations: [addProductToCartFunction] }],
            }
        });

        const functionCalls = response.functionCalls;
        if (functionCalls && functionCalls.length > 0) {
            const call = functionCalls[0];
            return {
                text: `Calling function ${call.name}`, // Placeholder, actual spoken response handled in component
                functionCall: { name: call.name, args: call.args }
            };
        }

        return { text: response.text || "I didn't quite catch that." };
    } catch (error) {
        console.error("Error getting AI chat response:", error);
        return { text: "I'm having a little trouble thinking right now. Please try again in a moment." };
    }
};