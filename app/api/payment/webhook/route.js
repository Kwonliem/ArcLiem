import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import User from '@/models/User';
import midtransClient from 'midtrans-client';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const notificationJson = await request.json();
    console.log("Menerima notifikasi dari Midtrans:", notificationJson);

    
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const signatureKey = crypto.createHash('sha512')
      .update(`${notificationJson.order_id}${notificationJson.status_code}${notificationJson.gross_amount}${serverKey}`)
      .digest('hex');

    
    if (signatureKey !== notificationJson.signature_key) {
      console.error("Signature key tidak valid.");
      return NextResponse.json({ message: "Invalid signature" }, { status: 400 });
    }

    
    const orderId = notificationJson.order_id;
    const transactionStatus = notificationJson.transaction_status;
    const fraudStatus = notificationJson.fraud_status;

    await dbConnect();

    
    const transaction = await Transaction.findOne({ midtransOrderId: orderId });
    if (!transaction) {
      console.error(`Transaksi dengan Order ID ${orderId} tidak ditemukan.`);
      return NextResponse.json({ message: "Transaksi tidak ditemukan" }, { status: 404 });
    }

    
    if (transaction.status !== 'pending') {
        console.log(`Transaksi ${orderId} sudah diproses sebelumnya dengan status: ${transaction.status}`);
        return NextResponse.json({ message: "Transaksi sudah diproses" }, { status: 200 });
    }

    
    if (transactionStatus == 'capture') {
        if (fraudStatus == 'accept') {
            
            transaction.status = 'success';
        }
    } else if (transactionStatus == 'settlement') {
        
        transaction.status = 'success';
    } else if (transactionStatus == 'cancel' || transactionStatus == 'deny' || transactionStatus == 'expire') {
        
        transaction.status = 'failed';
    }

    await transaction.save();
    if (transaction.status === 'success') {
        const user = await User.findById(transaction.userId);
        if (user) {
            user.credits += transaction.credits;
            await user.save();
            console.log(`Sukses! ${transaction.credits} kredit ditambahkan ke user ${user.email}`);
        }
    }

    return NextResponse.json({ message: "Notifikasi berhasil diproses" }, { status: 200 });

  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
