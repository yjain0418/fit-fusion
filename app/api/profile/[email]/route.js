import { Profile } from "@/lib/model/profile";
import { User } from '@/lib/model/user';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';

export async function GET(request, { params }) {
    try {
        // Use your existing connectDB function
        await connectDB();

        const { email } = params;
        
        if (!email) {
            return NextResponse.json(
                { success: false, message: "Email parameter is required" },
                { status: 400 }
            );
        }

        // Decode the email parameter
        const decodedEmail = decodeURIComponent(email);

        // Query with timeout
        const profile = await Profile.findOne({ email: decodedEmail }).maxTimeMS(8000);
        
        if (!profile) {
            return NextResponse.json(
                { success: false, message: "Profile not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            result: profile
        });

    } catch (error) {
        console.error("Error retrieving profile:", error);
        
        // Handle specific error types
        if (error.message.includes('timeout') || error.name === 'MongooseError') {
            return NextResponse.json(
                { 
                    success: false, 
                    message: "Request timeout. Please try again.",
                    error: "timeout"
                },
                { status: 503 }
            );
        }

        if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            return NextResponse.json(
                { 
                    success: false, 
                    message: "Database server unreachable. Please try again later.",
                    error: "connection_failed"
                },
                { status: 503 }
            );
        }
        
        return NextResponse.json(
            { 
                success: false, 
                message: "Failed to retrieve profile",
                error: error.message 
            },
            { status: 500 }
        );
    }
}

export async function PUT(request, { params }) {
    const { email } = params;

    if (!email) {
        return NextResponse.json({ success: false, message: 'Email parameter is missing' }, { status: 400 });
    }

    try {
        // Use your existing connectDB function
        await connectDB();

        const decodedEmail = decodeURIComponent(email);

        // Check if user exists with timeout
        const data = await User.findOne({ email: decodedEmail }).maxTimeMS(8000);

        if(!data) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        const body = await request.json();
        const { name, age, userType, gender, height, weight, phone, address, coins, reward, designation, experience, profilePhoto } = body;
        
        if (!age || !userType || !gender || !height || !weight || !phone || !address) {
            return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
        }
        
        if(userType == "trainer") {
            if(!designation || !experience) {
                return NextResponse.json({ success: false, message: 'Missing trainer fields (designation, experience)' }, { status: 400 });
            }
        }

        // Update profile with timeout
        const updatedProfile = await Profile.findOneAndUpdate(
            { email: decodedEmail },
            { name, age, userType, gender, height, weight, phone, address, coins, reward, designation, experience, profilePhoto },
            { new: true, runValidators: true, upsert: true }
        ).maxTimeMS(8000);

        return NextResponse.json({ success: true, result: updatedProfile }, { status: 200 });
    } catch (error) {
        console.error('Error updating profile:', error);
        
        // Handle timeout errors
        if (error.message.includes('timeout') || error.name === 'MongooseError') {
            return NextResponse.json(
                { 
                    success: false, 
                    message: "Request timeout. Please try again.",
                    error: "timeout"
                },
                { status: 503 }
            );
        }

        return NextResponse.json({ 
            success: false, 
            message: 'Failed to update profile',
            error: error.message 
        }, { status: 500 });
    }
}