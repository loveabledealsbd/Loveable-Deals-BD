import Title from "@/components/Title";
import React from "react";

const ContactPage = () => {
    return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center mx-6 my-20">
            <Title title="Contact Us" description="Get in touch with the Loveable Deals BD team." visibleButton={false} />
            <div className="max-w-xl w-full mt-10 bg-slate-50 p-8 rounded-2xl border border-slate-100 text-slate-600">
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-medium text-slate-800">Address</h3>
                        <p className="mt-1">Dhaka, Bangladesh</p>
                    </div>
                    <div>
                        <h3 className="text-lg font-medium text-slate-800">Phone</h3>
                        <p className="mt-1">+880 1575380707</p>
                    </div>
                    <div>
                        <h3 className="text-lg font-medium text-slate-800">Email</h3>
                        <p className="mt-1">loveabledealsbd@gmail.com</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
