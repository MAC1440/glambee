import { StaffDetail } from "@/features/staff/StaffDetail";
import { staff as allStaff } from "@/lib/placeholder-data";

export default function StaffDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const staffMember = allStaff.find((s) => s.id === params.id);

  return <StaffDetail staffMember={staffMember} />;
}
