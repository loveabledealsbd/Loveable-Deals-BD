import Title from "@/components/Title";
import React from "react";

const PrivacyPolicyPage = () => {
    return (
        <div className="min-h-[50vh] flex flex-col items-center mx-6 my-20">
            <Title title="Privacy Policy" description="How we handle and protect your data." visibleButton={false} />
            <div className="max-w-3xl w-full mt-10 text-slate-600 space-y-6">
                <section>
                    <h3 className="text-xl font-medium text-slate-800 mb-2">1. Information Collection</h3>
                    <p>We may collect personal information such as your name, email address, physical address, and phone number when you register for an account, place an order, or subscribe to our newsletter.</p>
                </section>
                <section>
                    <h3 className="text-xl font-medium text-slate-800 mb-2">2. How We Use Your Data</h3>
                    <p>Your data is strictly used to fulfill your orders, provide customer support, and improve the services we offer you. We may use your email to send promotional content if you have opted-in.</p>
                </section>
                <section>
                    <h3 className="text-xl font-medium text-slate-800 mb-2">3. Third-party Sharing</h3>
                    <p>We do not share your private data with unaffiliated third parties for their own marketing purposes. Your shipping information is only shared with our logistics partners to deliver your goods.</p>
                </section>
            </div>
        </div>
    );
};

export default PrivacyPolicyPage;
