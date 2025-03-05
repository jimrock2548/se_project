"use client";
import React from 'react';
import Link from "next/link";

function RentalBill() {
  return (
    <div className="p-6 min-h-screen flex items-center justify-center">
      <div className="bg-base-100 p-6 rounded-2xl shadow-lg w-full max-w-2xl">
        <h1 className="text-4xl font-bold text-center mb-4">บิลค่าเช่าห้อง</h1>
        <div className="text-lg text-center font-semibold mb-6">ห้องที่ 123</div>
        <div className="text-center mb-4">กุมภาพันธ์ 2025</div>

        <div className="border rounded-lg p-4">
          <div className="grid grid-cols-5 gap-2 font-bold border-b pb-2">
            <span>รายการ</span>
            <span className="text-center">เลขครั้งก่อน</span>
            <span className="text-center">เลขครั้งนี้</span>
            <span className="text-center">หน่วยที่ใช้</span>
            <span className="text-right">ราคาต่อหน่วย</span>
          </div>

          {/* ค่าน้ำ */}
          <div className="grid grid-cols-5 gap-2 py-2 border-b">
            <span>ค่าน้ำ</span>
            <span className="text-center">120</span>
            <span className="text-center">135</span>
            <span className="text-center">15</span>
            <span className="text-right">10</span>
          </div>

          {/* ค่าไฟ */}
          <div className="grid grid-cols-5 gap-2 py-2 border-b">
            <span>ค่าไฟ</span>
            <span className="text-center">4500</span>
            <span className="text-center">4700</span>
            <span className="text-center">200</span>
            <span className="text-right">5</span>
          </div>

          {/* อินเทอร์เน็ต & ค่าห้อง */}
          <div className="grid grid-cols-5 gap-2 py-2 border-b">
            <span>อินเทอร์เน็ต</span>
            <span className="col-span-3"></span>
            <span className="text-right">500</span>
          </div>
          <div className="grid grid-cols-5 gap-2 py-2">
            <span>ค่าเช่า</span>
            <span className="col-span-3"></span>
            <span className="text-right">3000</span>
          </div>
        </div>

        {/* รวม */}
        <div className="mt-4 flex justify-between font-bold text-xl border-t pt-4">
          <span>รวม</span>
          <span>4500 บาท</span>
        </div>

        {/* ปุ่มเลือกชำระเงิน */}
        <div className="mt-6 text-center">
          <Link href='/test/choose_payment'>
            <button className="btn btn-primary w-full text-white">เลือกวิธีจ่าย</button>
          </Link>
        </div>

        <div className="text-sm text-center mt-4">ชำระเงินทุกวันที่ 5 ของเดือน</div>
      </div>
    </div>
  );
}

export default RentalBill;
