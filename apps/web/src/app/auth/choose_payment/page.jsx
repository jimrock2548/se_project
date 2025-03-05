'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

function Page() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = () => {
    if (selectedFile) {
      alert(`Uploaded: ${selectedFile.name}`);
      setIsModalOpen(false);
    } else {
      alert('กรุณาเลือกไฟล์ก่อนอัพโหลด');
    }
  };

  return (
    <div className="p-6  min-h-screen flex items-center justify-center">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden max-w-lg w-full">
        <h1 className="text-4xl font-bold text-center py-6 bg-gradient-to-r  text-black">
          Choose a Payment
        </h1>
        <div className="p-6 space-y-6 text-center">
          <div className="flex justify-center">
            <img
              src="https://th.bing.com/th/id/OIP.AC1bS1beABbLeQF7-x_3wAAAAA?rs=1&pid=ImgDetMain"
              alt="QR Code"
              className="rounded-lg shadow-md w-64 h-64 object-contain border border-gray-300"
            />
          </div>
          <div className="text-lg font-medium text-gray-700">
            <p>💳 <span className="font-semibold">ธนาคาร:</span> กสิกร</p>
            <p>🏦 <span className="font-semibold">เลขบัญชี:</span> 020-100-625-777</p>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={() => router.back()}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full shadow-md"
            >
              ← ย้อนกลับ
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full shadow-md"
            >
              อัพโหลดสลิป
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
            <h2 className="text-2xl font-bold mb-4">อัพโหลดสลิป</h2>
            <input type="file" accept="image/*" onChange={handleFileChange} className="mb-4" />
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleUpload}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full"
              >
                อัพโหลด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Page;