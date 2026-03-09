import StoreLayout from "@/components/store/StoreLayout";

export const metadata = {
    title: "Loveable Deals BD. - Store Dashboard",
    description: "Loveable Deals BD. - Store Dashboard",
};

export default function RootAdminLayout({ children }) {

    return (
        <>
            <StoreLayout>
                {children}
            </StoreLayout>
        </>
    );
}
