import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import config from '../../../config';


export const useUserData = () => {
    return useQuery({
        queryKey: ['userData'],
        queryFn: async () => {
            const response = await axios.get(`${config.API_URL}/api/user/fetchData?datafor=user`, {
                withCredentials: true
            });
            return response.data.user;
        },
        staleTime: 1000 * 60 * 10
    })
}

export const useDailyTip = () => {
  return useQuery({
    queryKey: ['dailyTip'],
    queryFn: async () => {
      try {
        const response = await axios.get('https://api.adviceslip.com/advice');       
        return response.data.slip.advice; 
      } catch (error) {
        console.error("Failed to fetch advice slip:", error);
        throw new Error('Could not fetch a tip at this time.');
      }
    },
    refetchOnWindowFocus: false, 
    staleTime: 1000 * 60 * 60 * 24, 
  });
}