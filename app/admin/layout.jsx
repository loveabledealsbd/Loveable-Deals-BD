import AdminLayout from "@/components/admin/AdminLayout";

export const metadata = {
    title: "Loveable Deals BD. - Admin",
    description: "Loveable Deals BD. - Admin",
};

export default function RootAdminLayout({ children }) {

    return (
        <>
            <AdminLayout>
                {children}
            </AdminLayout>
        </>
    );
}
