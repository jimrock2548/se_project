import Link from "next/link";

const data = [
    { user: 101, room: 301, options: "รบกวน", description: "ร้องเพลงกันดังมากนอนไม่หลับ", },
    { user: 101, room: 301, options: "รบกวน", description: "ร้องเพลงกันดังมากนอนไม่หลับ", },
    { user: 101, room: 301, options: "รบกวน", description: "ร้องเพลงกันดังมากนอนไม่หลับ", },
    { user: 101, room: 301, options: "รบกวน", description: "ร้องเพลงกันดังมากนอนไม่หลับ", },
    { user: 101, room: 301, options: "รบกวน", description: "ร้องเพลงกันดังมากนอนไม่หลับ", },
    { user: 101, room: 301, options: "รบกวน", description: "ร้องเพลงกันดังมากนอนไม่หลับ", },
    { user: 101, room: 301, options: "รบกวน", description: "ร้องเพลงกันดังมากนอนไม่หลับ", },
    { user: 101, room: 301, options: "รบกวน", description: "ร้องเพลงกันดังมากนอนไม่หลับ", },
    { user: 101, room: 301, options: "รบกวน", description: "ร้องเพลงกันดังมากนอนไม่หลับ", },
    { user: 101, room: 301, options: "รบกวน", description: "ร้องเพลงกันดังมากนอนไม่หลับ", },
    { user: 101, room: 301, options: "รบกวน", description: "ร้องเพลงกันดังมากนอนไม่หลับ", },
    { user: 101, room: 301, options: "รบกวน", description: "ร้องเพลงกันดังมากนอนไม่หลับ", },

];

const dataannouncement = [
    { title: "Merry Christmas", date: "06/12/2024", message: "มีขนมแจกฟรีที่ lobby ช่วยกินหน่อย", },
    { title: "ไฟชั้น 2 เสีย", date: "07/02/2024", message: "กลับไปอยู่ห้องนะ ช่างกำลังจะมา", },
    { title: "Merry Christmas", date: "06/12/2024", message: "มีขนมแจกฟรีที่ lobby ช่วยกินหน่อย", },
    { title: "ไฟชั้น 2 เสีย", date: "07/02/2024", message: "กลับไปอยู่ห้องนะ ช่างกำลังจะมา", },
    { title: "Merry Christmas", date: "06/12/2024", message: "มีขนมแจกฟรีที่ lobby ช่วยกินหน่อย", },
    { title: "ไฟชั้น 2 เสีย", date: "07/02/2024", message: "กลับไปอยู่ห้องนะ ช่างกำลังจะมา", },
    { title: "Merry Christmas", date: "06/12/2024", message: "มีขนมแจกฟรีที่ lobby ช่วยกินหน่อย", },
    { title: "ไฟชั้น 2 เสีย", date: "07/02/2024", message: "กลับไปอยู่ห้องนะ ช่างกำลังจะมา", },
    { title: "Merry Christmas", date: "06/12/2024", message: "มีขนมแจกฟรีที่ lobby ช่วยกินหน่อย", },
    { title: "ไฟชั้น 2 เสีย", date: "07/02/2024", message: "กลับไปอยู่ห้องนะ ช่างกำลังจะมา", },
    { title: "Merry Christmas", date: "06/12/2024", message: "มีขนมแจกฟรีที่ lobby ช่วยกินหน่อย", },
    { title: "ไฟชั้น 2 เสีย", date: "07/02/2024", message: "กลับไปอยู่ห้องนะ ช่างกำลังจะมา", },
    { title: "Merry Christmas", date: "06/12/2024", message: "มีขนมแจกฟรีที่ lobby ช่วยกินหน่อย", },
    { title: "ไฟชั้น 2 เสีย", date: "07/02/2024", message: "กลับไปอยู่ห้องนะ ช่างกำลังจะมา", },
];

function Page() {
    return (
        <div className="p-6 min-h-screen">
            <div className="flex flex-wrap md:flex-nowrap space-y-4 md:space-y-0 md:space-x-4">

                {/* Announcement card */}
                <div className="md:col-span-2 p-6 rounded-lg shadow-2xl text-base-content w-full">
                <h1 className="text-4xl font-bold text-base-content mb-6">Announcement</h1>
                    <div className="mb-4 md:flex">
                        <fieldset className="fieldset pr-4">
                            <legend className="fieldset-legend">Title</legend>
                            <input type="text" className="input" placeholder="Title here..." />
                        </fieldset>

                        <fieldset className="fieldset pr-4">
                            <legend className="fieldset-legend">Date</legend>
                            <input type="date" className="input" />
                        </fieldset>

                        <fieldset className="fieldset pr-4">
                            <legend className="fieldset-legend">Massage</legend>
                            <input type="text" className="input md:pr-24" placeholder="Massage here..." />
                        </fieldset>
                    </div>
                    <div className="pb-7">
                        <button className="btn">Submit</button>
                    </div>
                    {/* Announcements List */}
                    <div className="overflow-y-scroll h-96 ">
                        {dataannouncement.map((announcement, index) => (
                            <div key={index} className="mb-2 border-l-4 border-red-500 pl-2">
                                <h2 className="text-lg font-semibold">{announcement.title}{" "}<span className="text-sm">({announcement.date})</span></h2>
                                <p className="text-sm">: {announcement.message}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Report card */}
                <div className="card-body shadow-2xl w-2xl rounded-lg">
                    <div className="flex items-center rounded-lg">
                        <div className="text-4xl font-bold text-base-content mb-6">Report</div>
                    </div>
                    <div className="overflow-y-scroll h-96">
                        {data.map((dataroom, index) => (
                            <div key={index} tabIndex={0} className="collapse collapse-plus bg-base-100 border-base-300 border">
                                <div className="collapse-title font-semibold">User : {dataroom.user} ({dataroom.room})</div>
                                <div className="collapse-content text-sm">
                                    Options : {dataroom.options} <br />
                                    Description : {dataroom.description}
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
