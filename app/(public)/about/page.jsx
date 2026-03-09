import Title from "@/components/Title";
import React from "react";

const AboutPage = () => {
    return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center mx-6 my-20">
            <Title title="About Us" description="Learn more about Loveable Deals BD and our mission." visibleButton={false} />
            <div className="max-w-3xl mt-10 text-slate-600 space-y-4">
                <p>Welcome to Loveable Deals BD, your ultimate destination for the latest and smartest gadgets. From smartphones and smartwatches to essential accessories, we bring you the best in innovation — all in one place.</p>
                <p>We are dedicated to providing the best shopping experience for our customers. We source only high quality products and work strictly with verified top-rated stores.</p>
                <p>Our goal is to make modern life simpler, faster, and more exciting. Happy shopping!</p>
            </div>
        </div>
    );
};

export default AboutPage;
