import { connString } from '@/lib/db';
import { User } from "@/lib/model/user"
import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

mongoose.connect(connString);

export async function POST(request) {
    try {
        const reqBody = await request.json().catch(() => null);
        const { email, password } = reqBody || {};

        // basic validation
        if (!email || !password) {
            console.warn('[login] missing email or password');
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        // normalize email to avoid case-sensitivity issues
        // const normalizedEmail = String(email).trim().toLowerCase();
        // console.log('[login] normalized email:', normalizedEmail);

        // check if user exists
        // const user = await User.findOne({ email: normalizedEmail });
        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ error: 'User does not exist' }, { status: 400 });
        }

        // check if password is correct (use async compare)
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return NextResponse.json({ error: 'Invalid Password' }, { status: 400 });
        }

        //create token data
        const tokenData = {
            id: user._id,
            name: user.name,
            email: user.email
        }

        //create token
        const token = jwt.sign(tokenData, process.env.JWT_SECRET_KEY, { expiresIn: '1d' });
        
        const response = NextResponse.json({
            message: "Login Successful",
            success: true,
        })
        
        response.cookies.set("token", token, {
            httpOnly: true,
        })
        return response;

    }catch(error) {
        return NextResponse.json({error: error.message},{ status:500 })
    }
}