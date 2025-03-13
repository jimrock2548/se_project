'use client'
import Link from "next/link";
import { useState } from "react";
import { useEffect } from 'react'
import { themeChange } from 'theme-change'


function Page() {
    const [isNight, setIsNight] = useState(false);

    useEffect(() => {
        themeChange(false); // เรียกใช้แค่ครั้งเดียว
        document.documentElement.setAttribute('data-theme', isNight ? 'dark' : 'winter');
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', isNight ? 'dark' : 'winter');
    }, [isNight]);

    return (
        <div className="pt-16 px-6 min-h-screen">
            <div className="flex flex-wrap md:flex-nowrap space-y-4 md:space-y-0 md:space-x-4">
                {/* Announcement card */}
                <div className="md:col-span-2 p-6 rounded-lg shadow-2xl text-base-content w-full ">
                    <h1 className="text-4xl font-bold text-base-content mb-6">ตั้งค่าของผู้ดูแล</h1>
                    <div className="flex">
                        <fieldset className="fieldset pr-4">
                            <legend className="fieldset-legend">ชื่อผู้ใช้</legend>
                            <input type="text" className="input" />
                        </fieldset>

                        <fieldset className="fieldset pr-4">
                            <legend className="fieldset-legend">รหัสผ่าน</legend>
                            <input type="text" className="input" />
                        </fieldset>
                    </div>
                    <div className="flex mb-4">
                        <fieldset className="fieldset pr-4">
                            <legend className="fieldset-legend">ชื่อจริง</legend>
                            <input type="text" className="input" />
                        </fieldset>

                        <fieldset className="fieldset pr-4">
                            <legend className="fieldset-legend">นามสกุล</legend>
                            <input type="text" className="input" />
                        </fieldset>
                    </div>
                    <div className="dropdown mb-6">
                        <div tabIndex={0} role="button" className="btn m-1">
                            เลือกธีม
                            <svg
                                width="12px"
                                height="12px"
                                className="inline-block h-2 w-2 fill-current opacity-60"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 2048 2048">
                                <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path>
                            </svg>
                        </div>
                        <ul tabIndex={0} className="dropdown-content bg-base-300 rounded-box z-1 w-52 p-2 shadow-2xl">
                            <li>
                                <label className="btn btn-sm btn-ghost justify-start">
                                    <input
                                        type="radio"
                                        name="theme-dropdown"
                                        className="theme-controller"
                                        value="light"
                                        checked={!isNight}
                                        onChange={() => setIsNight(false)}
                                    />
                                    ☀️ ธีมกลางวัน
                                </label>
                            </li>
                            <li>
                                <label className="btn btn-sm btn-ghost justify-start">
                                    <input
                                        type="radio"
                                        name="theme-dropdown"
                                        className="theme-controller"
                                        value="dark"
                                        checked={isNight}
                                        onChange={() => setIsNight(true)}
                                    />
                                    🌙 ธีมกลางคืน
                                </label>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <button className="btn btn-primary">เสร็จสิ้น</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Page;
