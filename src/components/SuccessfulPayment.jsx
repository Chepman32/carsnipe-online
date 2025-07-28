import React, { useEffect } from 'react';
import { supabase } from '../supabase';
import * as api from '../api/supabaseApi';

export default function SuccessfulPayment({playerInfo}) {
    const callLambdaFunction = async () => {
        try {
            // Update user money directly via Supabase
            const updatedUser = await api.updateUser(playerInfo.id, {
                money: (playerInfo.money || 0) + 100000 // Add $100k for successful payment
            });
            console.log('User money updated:', updatedUser);
        } catch (error) {
            console.error('Error updating user money:', error);
        }
    };

    const handleButtonClick = () => {
        callLambdaFunction();
    };

    return (
        <div>
            <div>Successful Payment</div>
            <button onClick={handleButtonClick}>Update User Money</button>
        </div>
    );
}
