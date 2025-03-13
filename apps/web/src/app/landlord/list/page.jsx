'use client'
import { useState } from "react";

const initialData = [
    { id: 101, username: "User1", name: "pick", surname: "busa", status: "ว่าง" },
    { id: 102, username: "User2", name: "john", surname: "doe", status: "ไม่ว่าง" },
    { id: 103, username: "User3", name: "jane", surname: "smith", status: "ว่าง" },
    { id: 104, username: "User4", name: "alice", surname: "brown", status: "ไม่ว่าง" },
    { id: 105, username: "User5", name: "bob", surname: "white", status: "ว่าง" },
    { id: 106, username: "User5", name: "bob", surname: "white", status: "ว่าง" },
    { id: 107, username: "User5", name: "bob", surname: "white", status: "ไม่ว่าง" },
    { id: 108, username: "User5", name: "bob", surname: "white", status: "ว่าง" },
    { id: 109, username: "User5", name: "bob", surname: "white", status: "ไม่ว่าง" },
    { id: 110, username: "User5", name: "bob", surname: "white", status: "ไม่ว่าง" },
    { id: 111, username: "User5", name: "bob", surname: "white", status: "ไม่ว่าง" },
    { id: 112, username: "User5", name: "bob", surname: "white", status: "ไม่ว่าง" },
    { id: 113, username: "User5", name: "bob", surname: "white", status: "ไม่ว่าง" },
    { id: 114, username: "User5", name: "bob", surname: "white", status: "ไม่ว่าง" },
    { id: 115, username: "User5", name: "bob", surname: "white", status: "ไม่ว่าง" },
    { id: 116, username: "User5", name: "bob", surname: "white", status: "ไม่ว่าง" },
    { id: 117, username: "User5", name: "bob", surname: "white", status: "ไม่ว่าง" },
    { id: 118, username: "User5", name: "bob", surname: "white", status: "ไม่ว่าง" },
    { id: 119, username: "User5", name: "bob", surname: "white", status: "ไม่ว่าง" },
    { id: 120, username: "User5", name: "bob", surname: "white", status: "ไม่ว่าง" },
];

function Page() {
    const [dataprelist, setDataprelist] = useState(initialData);
    const [searchTerm, setSearchTerm] = useState("");
    const [editData, setEditData] = useState(null);

    const handleDelete = (id) => {
        if (window.confirm("คุณต้องการลบผู้ใช้นี้หรือไม่?")) {
            setDataprelist(dataprelist.filter(user => user.id !== id));
        }
    };
    

    const filteredData = dataprelist.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.surname.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleEdit = (user) => {
        setEditData({ ...user });
        document.getElementById("editModal").showModal();
    }

    const handleChange = (e) => {
        setEditData({ ...editData, [e.target.name]: e.target.value });
    }

    const handleSave = () => {
        setDataprelist(dataprelist.map(user => (user.id === editData.id ? editData : user)));
        document.getElementById("editModal").close();
    }

    return (
        <div className="md:p-6 min-h-screen">
            <div className="flex flex-wrap md:flex-nowrap space-y-4 md:space-y-0 md:space-x-4">
                <div className="md:col-span-2 p-6 rounded-lg shadow-2xl text-base-content w-full">
                <h1 className="text-4xl font-bold text-base-content mb-6">รายชื่อผู้อยู่อาศัย</h1>
                    {/* ช่องค้นหา */}
                    <div className="p-2 pb-7 flex gap-2">
                        <label className="input flex-grow">
                            <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <path d="m21 21-4.3-4.3"></path>
                                </g>
                            </svg>
                            <input type="search" className="grow" placeholder="ค้นหา..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </label>
                    </div>

                    {/* ตารางข้อมูล */}
                    <div className="overflow-y-scroll h-5/6">
                        <table className="table w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-200 text-center">
                                    <th className="w-1/6 p-3">หมายเลขห้อง</th>
                                    <th className="w-1/6 p-3">ชื่อผู้ใช้</th>
                                    <th className="w-1/6 p-3">ชื่อจริง</th>
                                    <th className="w-1/6 p-3">นามสกุล</th>
                                    <th className="w-1/6 p-3">สถานะ</th>
                                    <th className="w-1/6 p-3">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((user, index) => (
                                    <tr key={user.id} className="border-b hover:bg-gray-100 text-center">
                                        <td className="p-3">{user.id}</td>
                                        <td className="p-3"><img src="https://img.daisyui.com/images/profile/demo/3@94.webp" alt="Profile" className=" mask mask-squircle h-12 w-12 mr-5 object-cover" />  {user.username}</td>
                                        <td className="p-3">{user.name}</td>
                                        <td className="p-3">{user.surname}</td>
                                        <td className="p-3">
                                            <div className={user.status === "ว่าง" ? "text-green-500 font-bold" : "text-red-500 font-bold"}>
                                                {user.status}
                                            </div>
                                        </td>
                                        <td className="flex justify-center gap-2 md:pt-5 pt-7">
                                            <button className="btn btn-error btn-sm" onClick={() => handleDelete(user.id)}>ลบ</button>
                                            <button className="btn btn-primary btn-sm" onClick={() => handleEdit(user)}>🖋 แก้ไข</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal แก้ไข */}
            <dialog id="editModal" className="modal">
                <div className="modal-box max-w-xl">
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </form>
                    <h3 className="font-bold text-lg ">แก้ไขข้อมูล</h3>
                    {editData && (
                        <div className="space-y-4 mt-4">
                            <label className="input input-bordered flex items-center gap-2">
                                ชื่อผู้ใช้:
                                <input type="text" name="username" value={editData.username} onChange={handleChange} className="grow" />
                            </label>
                            <label className="input input-bordered flex items-center gap-2">
                                ชื่อจริง:
                                <input type="text" name="name" value={editData.name} onChange={handleChange} className="grow" />
                            </label>
                            <label className="input input-bordered flex items-center gap-2">
                                นามสกุล:
                                <input type="text" name="surname" value={editData.surname} onChange={handleChange} className="grow" />
                            </label>
                            <div className="flex justify-end gap-2">
                                <button className="btn" onClick={() => document.getElementById("editModal").close()}>ยกเลิก</button>
                                <button className="btn btn-primary" onClick={handleSave}>บันทึก</button>
                            </div>
                        </div>
                    )}
                </div>
            </dialog>
        </div>
    );
}

export default Page;
