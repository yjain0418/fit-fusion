import { connString } from "@/lib/db";
import mongoose from "mongoose";
import { Profile } from '@/lib/model/profile';
import { NextResponse } from 'next/server';

export async function GET(req) {
    await mongoose.connect(connString);

    const { search = '', page = 1 } = req.nextUrl.searchParams;
    const perPage = 4;

    try {
        const query = { userType: 'Trainer' };
        if (search) {
            query.designation = new RegExp(search, 'i');
        }

        const data = await Profile.find(query)
            .sort({ name: -1 })
            .skip(perPage * (page - 1))
            .limit(perPage)
            .exec();

        const count = await Profile.countDocuments(query);
        const nextPage = parseInt(page) + 1;
        const hasNextPage = nextPage <= Math.ceil(count / perPage);

        return NextResponse.json({
            data,
            current: page,
            nextPage: hasNextPage ? nextPage : null,
        }, { status: 200 });
    } catch (error) {
        console.error('Error fetching trainers:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
