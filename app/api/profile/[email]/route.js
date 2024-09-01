import { connString } from '@/lib/db';
import { Profile } from "@/lib/model/profile";
import { User } from '@/lib/model/user';
import mongoose from 'mongoose';
import { NextResponse } from 'next/server';

// Connect to the database
mongoose.connect(connString)

export async function GET(request, { params }) {
    const { email } = params;

    if (!email) {
        return NextResponse.json({ success: false, message: 'Email parameter is missing' }, { status: 400 });
    }

    try {
        const data = await Profile.findOne({ email: email });

        if (!data) {
            return NextResponse.json({ success: false, message: 'Profile not found' }, { status: 404 });
        }

        return NextResponse.json({ result: data });
    } catch (error) {
        console.error('Error retrieving profile:', error);
        return NextResponse.json({ success: false, message: 'Failed to retrieve profile' }, { status: 500 });
    }
}

export async function POST(request, { params }) {
    const { email } = params;

    if (!email) {
        return NextResponse.json({ success: false, message: 'Email parameter is missing' }, { status: 400 });
    }

    try {
        const data = await User.findOne({ email: email });

        if(!data) {
            return NextResponse.json({ success: false, message: 'User error' }, { status: 400 });
        }

        const body = await request.json();
        const { age, userType, gender, height, weight, phoneNo, address, coins, reward, designation, experience } = body;
        const name = data.name;
        
        if (!age || !userType || !gender || !height || !weight || !phoneNo || !address) {
            return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
        }
        
        if(userType == "Trainer") {
            if(!designation || !experience) {
                return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
            }
        }

        const newProfile = new Profile({ name, email, age, userType, gender, height, weight, phoneNo, address, coins, reward, designation, experience });
        await newProfile.save();

        return NextResponse.json({ success: true, result: newProfile }, { status: 201 });
    } catch (error) {
        console.error('Error creating profile:', error);
        return NextResponse.json({ success: false, message: 'Failed to create profile' }, { status: 500 });
    }
}