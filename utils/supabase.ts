import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const serverStorage = {
    getItem: async () => null,
    setItem: async () => undefined,
    removeItem: async () => undefined,
};

const storage = Platform.OS === "web" && typeof window === "undefined" ? serverStorage : AsyncStorage;

export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        storage,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
    },
});
