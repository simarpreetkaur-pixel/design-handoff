import { Award, Languages } from "lucide-react"

import type { Customer } from "@/types/crm"

interface CustomerProfileCardProps {
  customer: Customer
}

function kycLabel(status: NonNullable<Customer["kycStatus"]>) {
  switch (status) {
    case "pending":
      return "Pending"
    case "verified":
      return "Verified"
    case "not_applicable":
      return "N/A"
    default:
      return status
  }
}

/**
 * Profile card — layout and chrome aligned with Figma OMNI Post-Sales (node 8393:27113).
 * @see https://www.figma.com/design/ItV6q2hj272EYkgVUtapxW/OMNI---Post-Sales?node-id=8393-27113
 */
export function CustomerProfileCard({ customer }: CustomerProfileCardProps) {
  const kyc = customer.kycStatus

  return (
    <section
      className="flex w-full flex-col gap-[15px] overflow-hidden rounded-[12px] border border-solid border-[#e7e7f0] bg-white py-4"
      data-node-id="8393:27113"
    >
      {/* Top: avatar + identity */}
      <div className="flex w-full px-5">
        <div className="flex min-w-0 items-start gap-[10px]">
          <div
            className="relative size-10 shrink-0 overflow-hidden rounded-[8.886px] bg-[#c3d7ff]"
            data-node-id="8393:28044"
          >
            <img
              src="/icons/profile-card-avatar.png"
              alt=""
              className="size-full object-cover"
              width={40}
              height={40}
            />
          </div>
          <div className="flex min-w-0 flex-col gap-2">
            <p className="font-euclid text-[18px] font-semibold leading-6 text-[#040222]">
              {customer.name}
            </p>
            <div className="flex flex-wrap items-center gap-4 opacity-80">
              <div className="flex items-center gap-1">
                <Languages className="size-4 shrink-0 text-[#5b5675]" aria-hidden />
                <span className="whitespace-nowrap font-euclid text-xs font-normal leading-[18px] text-[#5b5675]">
                  {customer.language}
                </span>
              </div>
              {customer.tenureWithAcko ? (
                <div className="flex items-center gap-1">
                  <Award className="size-4 shrink-0 text-[#5b5675]" aria-hidden />
                  <span className="whitespace-nowrap font-euclid text-xs font-normal leading-[18px] text-[#5b5675]">
                    {customer.tenureWithAcko}
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="h-px w-full shrink-0 bg-omni-n100" />

      {/* Bottom: App install | divider | KYC */}
      <div className="flex w-full flex-wrap items-center gap-3 px-5">
        <div className="flex items-center gap-2">
          <span className="whitespace-nowrap font-euclid text-sm font-normal leading-6 text-[#5b5675]">
            App install status
          </span>
          <div className="flex items-center gap-1">
            {customer.appStatus === "installed" ? (
              <>
                <img
                  src="/icons/profile-card-tick.png"
                  alt=""
                  className="size-4 shrink-0 object-contain"
                  width={16}
                  height={16}
                  aria-hidden
                />
                <span className="whitespace-nowrap font-euclid text-sm font-medium leading-normal text-[#0fa457]">
                  Installed
                </span>
              </>
            ) : (
              <span className="whitespace-nowrap font-euclid text-sm font-medium leading-normal text-[#5b5675]">
                Not installed
              </span>
            )}
          </div>
        </div>

        <div className="hidden h-4 w-px shrink-0 bg-[#e7e7f0] sm:block" aria-hidden />

        <div className="flex items-center gap-2">
          <span className="whitespace-nowrap font-euclid text-sm font-normal leading-6 text-[#5b5675]">
            KYC Status
          </span>
          <div className="flex items-center gap-1">
            {kyc === "verified" ? (
              <>
                <img
                  src="/icons/profile-card-tick.png"
                  alt=""
                  className="size-4 shrink-0 object-contain"
                  width={16}
                  height={16}
                  aria-hidden
                />
                <span className="whitespace-nowrap font-euclid text-sm font-medium leading-normal text-[#0fa457]">
                  {kycLabel(kyc)}
                </span>
              </>
            ) : kyc === "pending" ? (
              <>
                <img
                  src="/icons/profile-card-kyc-pending.png"
                  alt=""
                  className="size-4 shrink-0 object-contain"
                  width={16}
                  height={16}
                  aria-hidden
                />
                <span className="whitespace-nowrap font-euclid text-sm font-medium leading-normal text-[#f58700]">
                  {kycLabel(kyc)}
                </span>
              </>
            ) : kyc === "not_applicable" ? (
              <span className="whitespace-nowrap font-euclid text-sm font-medium leading-normal text-[#5b5675]">
                {kycLabel(kyc)}
              </span>
            ) : (
              <span className="whitespace-nowrap font-euclid text-sm font-medium leading-normal text-[#5b5675]">
                —
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
