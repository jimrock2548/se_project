'use client'
import Link from "next/link";
import { useState } from "react";



function Page() {
    const datapayment = [
        { user: "Copter", room: 123, billsnew: 4521.23, billsold: 4643.35, dateold: '06/11/2568',datenew: "06/12/2568", slip: "https://scontent.fbkk5-6.fna.fbcdn.net/v/t1.15752-9/480951741_951350990101887_201108737866095354_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=9f807c&_nc_ohc=D4VnPqmzElMQ7kNvgExlL1g&_nc_oc=AdiYDXcYHnWytBpy9_Ix5cR-8JxT43sHCCaAxTFhvi6mRF567UfYUe9w8b1wi8hzLe0&_nc_zt=23&_nc_ht=scontent.fbkk5-6.fna&oh=03_Q7cD1wFcWtHTUZrD0fHOlWNB_s8isj5fzozQv9msTwznlCEoLA&oe=67F3ACB2" },
        { user: "Copter", room: 123, billsnew: 4521.23, billsold: 4643.35, dateold: '06/11/2568',datenew: "06/12/2568", slip: "https://scontent.fbkk5-6.fna.fbcdn.net/v/t1.15752-9/480951741_951350990101887_201108737866095354_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=9f807c&_nc_ohc=D4VnPqmzElMQ7kNvgExlL1g&_nc_oc=AdiYDXcYHnWytBpy9_Ix5cR-8JxT43sHCCaAxTFhvi6mRF567UfYUe9w8b1wi8hzLe0&_nc_zt=23&_nc_ht=scontent.fbkk5-6.fna&oh=03_Q7cD1wFcWtHTUZrD0fHOlWNB_s8isj5fzozQv9msTwznlCEoLA&oe=67F3ACB2" },
        { user: "Copter", room: 123, billsnew: 4521.23, billsold: 4643.35, dateold: '06/11/2568',datenew: "06/12/2568", slip: "https://scontent.fbkk5-6.fna.fbcdn.net/v/t1.15752-9/480951741_951350990101887_201108737866095354_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=9f807c&_nc_ohc=D4VnPqmzElMQ7kNvgExlL1g&_nc_oc=AdiYDXcYHnWytBpy9_Ix5cR-8JxT43sHCCaAxTFhvi6mRF567UfYUe9w8b1wi8hzLe0&_nc_zt=23&_nc_ht=scontent.fbkk5-6.fna&oh=03_Q7cD1wFcWtHTUZrD0fHOlWNB_s8isj5fzozQv9msTwznlCEoLA&oe=67F3ACB2" },
        { user: "Copter", room: 123, billsnew: 4521.23, billsold: 4643.35, dateold: '06/11/2568',datenew: "06/12/2568", slip: "https://scontent.fbkk5-6.fna.fbcdn.net/v/t1.15752-9/480951741_951350990101887_201108737866095354_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=9f807c&_nc_ohc=D4VnPqmzElMQ7kNvgExlL1g&_nc_oc=AdiYDXcYHnWytBpy9_Ix5cR-8JxT43sHCCaAxTFhvi6mRF567UfYUe9w8b1wi8hzLe0&_nc_zt=23&_nc_ht=scontent.fbkk5-6.fna&oh=03_Q7cD1wFcWtHTUZrD0fHOlWNB_s8isj5fzozQv9msTwznlCEoLA&oe=67F3ACB2" },
        { user: "Copter", room: 123, billsnew: 4521.23, billsold: 4643.35, dateold: '06/11/2568',datenew: "06/12/2568", slip: "https://scontent.fbkk5-6.fna.fbcdn.net/v/t1.15752-9/480951741_951350990101887_201108737866095354_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=9f807c&_nc_ohc=D4VnPqmzElMQ7kNvgExlL1g&_nc_oc=AdiYDXcYHnWytBpy9_Ix5cR-8JxT43sHCCaAxTFhvi6mRF567UfYUe9w8b1wi8hzLe0&_nc_zt=23&_nc_ht=scontent.fbkk5-6.fna&oh=03_Q7cD1wFcWtHTUZrD0fHOlWNB_s8isj5fzozQv9msTwznlCEoLA&oe=67F3ACB2" },
        { user: "Copter", room: 123, billsnew: 4521.23, billsold: 4643.35, dateold: '06/11/2568',datenew: "06/12/2568", slip: "https://scontent.fbkk5-6.fna.fbcdn.net/v/t1.15752-9/480951741_951350990101887_201108737866095354_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=9f807c&_nc_ohc=D4VnPqmzElMQ7kNvgExlL1g&_nc_oc=AdiYDXcYHnWytBpy9_Ix5cR-8JxT43sHCCaAxTFhvi6mRF567UfYUe9w8b1wi8hzLe0&_nc_zt=23&_nc_ht=scontent.fbkk5-6.fna&oh=03_Q7cD1wFcWtHTUZrD0fHOlWNB_s8isj5fzozQv9msTwznlCEoLA&oe=67F3ACB2" },
        { user: "Copter", room: 123, billsnew: 4521.23, billsold: 4643.35, dateold: '06/11/2568',datenew: "06/12/2568", slip: "https://scontent.fbkk5-6.fna.fbcdn.net/v/t1.15752-9/480951741_951350990101887_201108737866095354_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=9f807c&_nc_ohc=D4VnPqmzElMQ7kNvgExlL1g&_nc_oc=AdiYDXcYHnWytBpy9_Ix5cR-8JxT43sHCCaAxTFhvi6mRF567UfYUe9w8b1wi8hzLe0&_nc_zt=23&_nc_ht=scontent.fbkk5-6.fna&oh=03_Q7cD1wFcWtHTUZrD0fHOlWNB_s8isj5fzozQv9msTwznlCEoLA&oe=67F3ACB2" },
        { old_water_unit:120, old_ele_unit:460, user: "Copter", room: 123, billsnew: 4521.23, billsold: 4643.35, dateold: '06/11/2568',datenew: "06/12/2568", slip: "https://scontent.fbkk5-6.fna.fbcdn.net/v/t1.15752-9/480951741_951350990101887_201108737866095354_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=9f807c&_nc_ohc=D4VnPqmzElMQ7kNvgExlL1g&_nc_oc=AdiYDXcYHnWytBpy9_Ix5cR-8JxT43sHCCaAxTFhvi6mRF567UfYUe9w8b1wi8hzLe0&_nc_zt=23&_nc_ht=scontent.fbkk5-6.fna&oh=03_Q7cD1wFcWtHTUZrD0fHOlWNB_s8isj5fzozQv9msTwznlCEoLA&oe=67F3ACB2" },
    ];
    
    const [defaultwater,setdefaultwater] = useState(18);
    const [defaultelectricity , setdefauleletricity] = useState(8);
    const [defaulnet , setdefaulnet] = useState(200);
    const [defaulrent, setdefaulrent] = useState(3000);
    const [newwater, setnewwater] = useState("0");
    const [newelectricity, setnewelectricity] = useState("0");
    const [totalall, settotalall] = useState("-");

    const calculaterent = () => {
        const dataaa = datapayment.find(d => d.old_water_unit && d.old_ele_unit);
        const W = newwater;
        const E = newelectricity;

        if (!newwater || !newelectricity) {
        alert("ข้อมูลหน่วยนํ้าหรือไฟฟ้าไม่ครบถ้วน");
        return;
    }
        const total_water = (W - dataaa.old_water_unit) * defaultwater;
        const total_ele = Math.abs(E - dataaa.old_ele_unit) * defaultelectricity;
        const alltotal = total_water + total_ele + defaulnet + defaulrent;
        
    settotalall(alltotal.toFixed(2));
    }

    return (
        <div className="pt-16 px-6 min-h-screen">
            <div className="flex flex-wrap md:flex-nowrap space-y-4 md:space-y-0 md:space-x-4">
                {/* Announcement card */}
                <div className="md:col-span-2 p-6 rounded-lg shadow-2xl text-base-content w-full ">
                    <h1 className="text-4xl font-bold text-base-content mb-6">กรอบแบบฟอร์มใบชำระเงิน</h1>
                    <div className="mb-4 ">
                        <fieldset className="fieldset pr-4">
                            <legend className="fieldset-legend">หมายเลขห้อง</legend>
                            <input type="number" className="input" placeholder="ใส่เลขที่ห้องตรงนี้..." />
                        </fieldset>
                    </div>
                    <div className="flex">
                        <fieldset className="fieldset pr-4">
                            <legend className="fieldset-legend">ค่าไฟฟ้า : ราคาต่อหน่วย</legend>
                            <input type="number" className="input"value={defaultelectricity} onChange={(e) => setdefauleletricity(Number(e.target.value))}/>
                        </fieldset>

                        <fieldset className="fieldset pr-4">
                            <legend className="fieldset-legend">ค่าไฟฟ้า  : จำนวนหน่วย</legend>
                            <input className="input"  value={newelectricity} onChange={(e) => setnewelectricity(Number(e.target.value))}/>
                        </fieldset>
                    </div>
                    <div className="flex">
                        <fieldset className="fieldset pr-4">
                            <legend className="fieldset-legend">ค่านํ้า : ราคาต่อหน่อย</legend>
                            <input type="number" className="input" value={defaultwater} onChange={(e) => setdefaultwater(Number(e.target.value))}/>
                        </fieldset>

                        <fieldset className="fieldset pr-4">
                            <legend className="fieldset-legend">ค่านํ้า : จำนวนหน่วย</legend>
                            <input className="input"  value={newwater} onChange={(e) => setnewwater(Number(e.target.value))}/>
                        </fieldset>
                    </div>
                    <div className="flex">
                        <fieldset className="fieldset pr-4">
                            <legend className="fieldset-legend">ค่าอินเตอร์เน็ต</legend>
                            <input type="number" className="input" value={defaulnet} onChange={(e) => setdefaulnet(Number(e.target.value))}/>
                        </fieldset>

                        <fieldset className="fieldset pr-4">
                            <legend className="fieldset-legend">ค่าหอพัก</legend>
                            <input type="number" className="input" value={defaulrent} onChange={(e) => setdefaulrent(Number(e.target.value))}/>
                        </fieldset>
                    </div>
                    <div className="mb-4 ">
                        <fieldset className="fieldset pr-4">
                            <legend className="fieldset-legend">ราคารวมทั้ง</legend>
                            <input type="text" className="input" value={totalall} readOnly></input>
                        </fieldset>
                    </div>
                    <div className="pb-7">
                        <button className="btn btn-primary" onClick={calculaterent}>เสร็จสิ้น</button>
                    </div>
                </div>

                <div className="card-body shadow-2xl w-4xl rounded-lg">
                    <div className="flex items-center rounded-lg">
                        <div className="text-4xl font-bold text-base-content mb-6">รายการใบชำระ</div>
                    </div>
                    <div className="overflow-y-scroll h-96">
                        {datapayment.map((dataroom, index) => (
                            <div key={index} tabIndex={0} className="collapse collapse-plus bg-base-100 border-base-300 border">
                                <div className="collapse-title font-semibold">User : {dataroom.user} ({dataroom.room}) <div aria-label="success" className="status status-success"></div></div>
                                <div className="collapse-content text-sm">
                                    รายการใบชำระค้าง: <br />- {dataroom.billsnew} บาท ({dataroom.datenew}) <br />
                                    - {dataroom.billsold} บาท ({dataroom.dateold})<br />
                                    {dataroom.slip ? (
                                        <img src={dataroom.slip} alt="ใบเสร็จ" className="w-64 h-auto rounded-lg mt-2"/>
                                    ) : (
                                        <p className="text-gray-500">ไม่มีภาพใบเสร็จ</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Page;
