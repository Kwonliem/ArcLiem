import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Transaction from "@/models/Transaction";
import { creditPackages } from "@/lib/packages";
import { NextResponse } from "next/server";
import midtransClient from 'midtrans-client';


let snap = new midtransClient.Snap({
    isProduction : false,
    serverKey : process.env.MIDTRANS_SERVER_KEY,
    clientKey : process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
});

export async function POST(request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Akses ditolak." }, { status: 401 });
    }

    try {
        const { packageId } = await request.json();
        const selectedPackage = creditPackages.find(p => p.id === packageId);

        if (!selectedPackage) {
            return NextResponse.json({ message: "Paket tidak ditemukan." }, { status: 404 });
        }

        await dbConnect();
        const user = await User.findById(session.user.id);
        if (!user) {
            return NextResponse.json({ message: "User tidak ditemukan." }, { status: 404 });
        }

        const orderId = `ARCLIEM-${user._id.toString().slice(-4)}-${Date.now()}`;

        
        let parameter = {
            "transaction_details": {
                "order_id": orderId,
                "gross_amount": selectedPackage.price
            },
            "customer_details": {
                "first_name": user.name,
                "email": user.email,
            },
            "item_details": [{
                "id": selectedPackage.id,
                "price": selectedPackage.price,
                "quantity": 1,
                "name": selectedPackage.name,
                "category": "Credits"
            }],
            "callbacks": {
                
                "finish": `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/settings`
            }
        };

        const transactionToken = await snap.createTransactionToken(parameter);

        await Transaction.create({
            userId: user._id,
            packageId: selectedPackage.id,
            credits: selectedPackage.credits,
            amount: selectedPackage.price,
            status: 'pending',
            midtransOrderId: orderId,
        });

        return NextResponse.json({ token: transactionToken }, { status: 200 });

    } catch (error) {
        console.error("Create Transaction Error:", error);
        return NextResponse.json({ message: `Terjadi kesalahan: ${error.message}` }, { status: 500 });
    }
}
