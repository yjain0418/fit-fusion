import { rapidApiKey } from "@/constants";
import axios from "axios";

const baseUrl = 'https://exercisedb.p.rapidapi.com';

const apiCall = async (url, params)=>{
    try {
        const options = {
            method: 'GET',
            url,
            params,
            headers : {
                'X-RapidAPI-Key': rapidApiKey,
                'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
            }
        };
        const response = await axios.request(options);
        return response.data;
    } catch (error) {
        console.log('error', error.message)
    }
}

export const fetchExercises = async (bodyPart)=>{
    let data = await apiCall(baseUrl + `/exercises/bodyPart/${bodyPart}`);
    return data;
}