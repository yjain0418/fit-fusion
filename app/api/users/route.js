import { connString } from '@/lib/db';
import { User } from "@/lib/model/user"
import mongoose from 'mongoose';
import { NextResponse } from 'next/server';

export async function GET() {
    
    let data = []

    try {
        await mongoose.connect(connString);
        data = await User.find();
    }catch(error) {
        data={success:false}
    }

    return NextResponse.json({result: data});
}

export async function POST(request) {
    try{
        const req = await request.json();
        await mongoose.connect(connString);
    
        let user = new User(req);
        const result = await user.save();
        return NextResponse.json({result, success:true});
    }catch(error) {
        console.log(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}