import axios from "axios";
import { Alert } from "react-native";
import BASE_URL from "../utils/BASE_URL";

export default CheckSubscription = async (userId) => {
    try {
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `${BASE_URL}/allergy_data/v1/user/${userId}/check_premium`,
            headers: {},
            timeout: 10000, // 10 second timeout
        };

        const response = await axios.request(config);
        return response?.data;
    } catch (error) {
        console.log("❌ CheckSubscription API failed:", error.message);
        return null; // Return null so the caller knows to check the cache
    }
};