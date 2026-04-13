import axios from 'axios';
import BASE_URL from '../utils/BASE_URL';

/**
 * Verifies a restored purchase with the backend API.
 * 
 * @param {string} userId - The user's ID.
 * @param {object} payload - Platform specific payload.
 *   Android: { platform: 'google', purchaseToken, productId }
 *   iOS: { platform: 'apple', signedTransactionInfo }
 */
const VerifyRestoreSubscription = async (userId, payload) => {
  try {
    const config = {
      method: 'post',
      url: `${BASE_URL}/allergy_data/v1/user/${userId}/verify_subscription`,
      headers: { 
        'Content-Type': 'application/json' 
      },
      data: payload,
    };

    const response = await axios.request(config);
    console.log('✅ Subscription verification response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ VerifyRestoreSubscription error:', error.response?.data || error.message);
    throw error;
  }
};

export default VerifyRestoreSubscription;
