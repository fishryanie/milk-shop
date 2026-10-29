export type SellerProfile = {
  legalName: string;
  registrationNumber: string;
  taxId: string;
  registeredAddress: string;
  email: string;
  hasExampleData: boolean;
  hasExampleEmail: boolean;
};

// Pass the server environment explicitly. Only these public fields are returned.
// Reserved example values must never be mistaken for a real business identity.
export function sellerProfile(env: Record<string, string | undefined> = {}): SellerProfile {
  const fields = {
    legalName: ["SELLER_LEGAL_NAME", "HỘ KINH DOANH CÁI TIỆM SỮA (THÔNG TIN MẪU)"],
    registrationNumber: ["SELLER_REGISTRATION_NUMBER", "ĐKKD-MẪU-000000"],
    taxId: ["SELLER_TAX_ID", "0000000000 (mẫu)"],
    registeredAddress: ["SELLER_REGISTERED_ADDRESS", "123 Đường Mẫu, TP.HCM (thông tin mẫu)"],
    email: ["SELLER_SUPPORT_EMAIL", "lienhe@example.invalid"],
  } as const;
  const values = Object.fromEntries(
    Object.entries(fields).map(([field, [key, fallback]]) => [field, env[key]?.trim() || fallback]),
  ) as Omit<SellerProfile, "hasExampleData" | "hasExampleEmail">;
  return {
    ...values,
    hasExampleData: Object.values(fields).some(([key]) => !env[key]?.trim()),
    hasExampleEmail: !env.SELLER_SUPPORT_EMAIL?.trim(),
  };
}
