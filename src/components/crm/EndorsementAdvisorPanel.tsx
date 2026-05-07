import { useCallback, useId, useState, type ChangeEvent, type ReactNode } from "react"
import { ArrowLeft, FileUp, Upload } from "lucide-react"

import type { Policy } from "@/types/crm"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type EndorsementRowMode = "edit" | "add"

export type EndorsementPolicyFieldRow = {
  id: string
  label: string
  value?: string
  mode: EndorsementRowMode
}

/** Demo rows — motor (Figma [8484:1373](https://www.figma.com/design/ItV6q2hj272EYkgVUtapxW/OMNI---Post-Sales?node-id=8484-1373)). */
export const DEMO_MOTOR_ENDORSEMENT_ROWS: EndorsementPolicyFieldRow[] = [
  { id: "address", label: "Address", value: "Amravati", mode: "edit" },
  { id: "engine", label: "Engine Number", value: "JC85E1085426", mode: "edit" },
  { id: "chassis", label: "Chassis Number", value: "ME4JC583JC8085423", mode: "edit" },
  { id: "registration", label: "Registration Number", value: "MH27AU9709", mode: "edit" },
  { id: "nominee", label: "Nominee", value: "Harsh", mode: "edit" },
  { id: "name", label: "Name", value: "Sunil Prakash Gupta", mode: "edit" },
  { id: "loan_provider", label: "Loan Provider", mode: "add" },
  { id: "gstin", label: "GSTIN Number", mode: "add" },
  { id: "pa_cover", label: "Personal Accident Cover", mode: "add" },
  { id: "electrical_acc", label: "Electrical Accessories Cover", mode: "add" },
  { id: "non_electrical_acc", label: "Non-Electrical Accessories Cover", mode: "add" },
]

/** Health — illustrative rows when opening endorsement on a health policy. */
export const DEMO_HEALTH_ENDORSEMENT_ROWS: EndorsementPolicyFieldRow[] = [
  { id: "ph_name", label: "Policy holder name", value: "Sunil Gupta", mode: "edit" },
  { id: "email", label: "Email ID", value: "sunil.gupta@hotmail.com", mode: "edit" },
  { id: "phone", label: "Mobile number", value: "+91 76543 21098", mode: "edit" },
  { id: "nominee", label: "Nominee", value: "Neha Gupta", mode: "edit" },
  { id: "address", label: "Address", value: "Pune, Maharashtra", mode: "edit" },
  { id: "sum_insured", label: "Sum insured revision", mode: "add" },
  { id: "member_add", label: "Add member", mode: "add" },
]

function rowsForPolicy(policy: Policy): EndorsementPolicyFieldRow[] {
  if (policy.type === "Health Insurance") return DEMO_HEALTH_ENDORSEMENT_ROWS
  return DEMO_MOTOR_ENDORSEMENT_ROWS
}

function policySubtitle(policy: Policy): string {
  return [policy.name, policy.vehicle].filter(Boolean).join(" · ")
}

function AddFieldStep({ fieldLabel, onBack }: { fieldLabel: string; onBack: () => void }) {
  return (
    <div className="flex w-full flex-col bg-white">
      <div className="flex shrink-0 flex-col gap-1 border-b border-[#e7e7f0] px-5 py-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-[#5b5675] transition-colors hover:bg-[#f4f4f6] hover:text-[#36354c]"
            aria-label="Back to policy fields"
          >
            <ArrowLeft className="size-5" aria-hidden />
          </button>
          <div className="min-w-0">
            <h2 className="font-euclid text-[16px] font-medium leading-6 text-[#040222]">Add {fieldLabel}</h2>
            <p className="mt-0.5 font-euclid text-[14px] font-normal leading-5 text-[#5b5675]">
              New coverage or details
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-6 px-5 py-6">
        <p className="font-euclid text-[14px] leading-5 text-[#36354c]">
          Confirm eligibility with the customer on the call, then enter this information in Advisor UI. If the
          change depends on vehicle registration data, collect and upload the RC in the Edit Policy flow before
          submitting.
        </p>
        <Button
          type="button"
          className="h-10 w-full rounded-lg bg-[#7c47e1] font-euclid text-[14px] font-medium text-white hover:bg-[#7c47e1]/90 sm:ml-auto sm:w-auto sm:self-end"
          onClick={onBack}
        >
          Back to list
        </Button>
      </div>
    </div>
  )
}

type UploadRcStepProps = {
  fieldLabel: string
  fileInputId: string
  selectedFileName: string | null
  onFileChange: (file: File | null) => void
  onBack: () => void
  onContinue: () => void
  /** Motor endorsements reference RC; health uses generic proof copy. */
  variant: "motor" | "health"
}

function UploadRcStep({
  fieldLabel,
  fileInputId,
  selectedFileName,
  onFileChange,
  onBack,
  onContinue,
  variant,
}: UploadRcStepProps) {
  const handleInput = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0] ?? null
      onFileChange(f)
    },
    [onFileChange],
  )

  const title = variant === "motor" ? "Upload RC" : "Upload supporting proof"
  const lead =
    variant === "motor"
      ? "Upload a clear photo or PDF of the vehicle Registration Certificate (RC). The engine, chassis, and registered owner details on the RC should match what you want on the policy before you submit the change in Advisor UI."
      : "Upload a clear government ID or supporting document that matches the change you are making (e.g. address proof, name correction proof). Use Advisor UI to finish this step in Edit Policy once the file is ready."

  return (
    <div className="flex w-full flex-col bg-white">
      <div className="flex shrink-0 flex-col gap-1 border-b border-[#e7e7f0] px-5 py-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-[#5b5675] transition-colors hover:bg-[#f4f4f6] hover:text-[#36354c]"
            aria-label="Back to policy fields"
          >
            <ArrowLeft className="size-5" aria-hidden />
          </button>
          <div className="min-w-0">
            <h2 className="font-euclid text-[16px] font-medium leading-6 text-[#040222]">{title}</h2>
            <p className="mt-0.5 font-euclid text-[14px] font-normal leading-5 text-[#5b5675]">
              Updating <span className="font-medium text-[#36354c]">{fieldLabel}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-5 py-6">
        <p className="font-euclid text-[14px] leading-5 text-[#36354c]">{lead}</p>

        <div>
          <input id={fileInputId} type="file" accept="image/*,.pdf" className="sr-only" onChange={handleInput} />
          <label
            htmlFor={fileInputId}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-[#e7e7f0] bg-[#fafafa] px-6 py-10 text-center transition-colors hover:border-[#7c47e1]/40 hover:bg-[#f8f7fd]",
              selectedFileName && "border-[#7c47e1]/50 bg-[#f8f7fd]",
            )}
          >
            <div className="flex size-12 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-[#e7e7f0]">
              <Upload className="size-6 text-[#7c47e1]" aria-hidden />
            </div>
            <div>
              <p className="font-euclid text-[14px] font-medium text-[#36354c]">Choose file or drag here</p>
              <p className="mt-1 font-euclid text-[12px] leading-[18px] text-[#5b5675]">PNG, JPG, or PDF · max 10 MB</p>
            </div>
            {selectedFileName ? (
              <p className="flex items-center gap-2 font-euclid text-[13px] font-medium text-[#0fa457]">
                <FileUp className="size-4 shrink-0" aria-hidden />
                {selectedFileName}
              </p>
            ) : null}
          </label>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-lg border-[#e7e7f0] font-euclid text-[14px] font-medium text-[#36354c] hover:bg-[#fafafa]"
            onClick={onBack}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="h-10 rounded-lg bg-[#7c47e1] px-6 font-euclid text-[14px] font-medium text-white hover:bg-[#7c47e1]/90"
            disabled={!selectedFileName}
            onClick={onContinue}
          >
            Continue to Advisor UI
          </Button>
        </div>
      </div>
    </div>
  )
}

type EndorsementAdvisorPanelProps = {
  policy: Policy
  onBack: () => void
  /** Override demo rows (e.g. tests). */
  rows?: EndorsementPolicyFieldRow[]
  /**
   * Hello workflow: hide top nav row — outer chrome provides title + close.
   * Inner Edit / Add / Upload flows keep their own headers.
   */
  embedded?: boolean
  /**
   * Optional control on the right of the top bar (e.g. Hello pane close), same row as back + title.
   * Only used with {@link variant} `"helloPane"`. Ignored when `embedded` is true (top bar hidden).
   */
  headerTrailing?: ReactNode
  /**
   * `page` — Classic JTBD / Action detail chrome (bordered “Update policy” block, top bar rule).
   * `helloPane` — Hello split-pane only (flat list, optional {@link headerTrailing}).
   */
  variant?: "page" | "helloPane"
}

export function EndorsementAdvisorPanel({
  policy,
  onBack,
  rows: rowsProp,
  embedded = false,
  headerTrailing,
  variant = "page",
}: EndorsementAdvisorPanelProps) {
  const rows = rowsProp ?? rowsForPolicy(policy)
  const fileInputId = useId()
  type Inner = null | { kind: "upload_rc"; field: { id: string; label: string } } | { kind: "add"; field: { id: string; label: string } }
  const [inner, setInner] = useState<Inner>(null)
  const [rcFile, setRcFile] = useState<File | null>(null)

  const subtitle = policySubtitle(policy)
  const helloPaneLayout = variant === "helloPane" || embedded

  const openField = (row: EndorsementPolicyFieldRow) => {
    const field = { id: row.id, label: row.label }
    setRcFile(null)
    setInner(row.mode === "edit" ? { kind: "upload_rc", field } : { kind: "add", field })
  }

  const closeInner = () => {
    setInner(null)
    setRcFile(null)
  }

  if (inner?.kind === "upload_rc") {
    const uploadVariant = policy.type === "Health Insurance" ? "health" : "motor"
    return (
      <UploadRcStep
        fieldLabel={inner.field.label}
        fileInputId={fileInputId}
        selectedFileName={rcFile?.name ?? null}
        onFileChange={setRcFile}
        onBack={closeInner}
        onContinue={closeInner}
        variant={uploadVariant}
      />
    )
  }

  if (inner?.kind === "add") {
    return <AddFieldStep fieldLabel={inner.field.label} onBack={closeInner} />
  }

  const rowList = (
    <ul className="divide-y divide-[#e7e7f0]">
      {rows.map((row) => (
        <li
          key={row.id}
          className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-5 py-3.5 sm:flex-nowrap"
        >
          <span className="min-w-[120px] font-euclid text-[14px] font-normal leading-5 text-[#5b5675]">
            {row.label}
          </span>
          <span className="min-w-0 flex-1 font-euclid text-[14px] font-medium leading-5 text-[#36354c] sm:text-right">
            {row.mode === "add" ? <span className="text-[#9c9aaf]">—</span> : (row.value ?? "—")}
          </span>
          {row.mode === "edit" ? (
            <button
              type="button"
              onClick={() => openField(row)}
              className="shrink-0 rounded-sm font-euclid text-[14px] font-medium leading-5 text-[#7c47e1] transition-colors hover:text-[#44277b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c47e1]/25"
            >
              Edit
            </button>
          ) : (
            <button
              type="button"
              onClick={() => openField(row)}
              className="shrink-0 rounded-sm font-euclid text-[14px] font-medium leading-5 text-[#7c47e1] transition-colors hover:text-[#44277b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c47e1]/25"
            >
              Add
            </button>
          )}
        </li>
      ))}
    </ul>
  )

  return (
    <div className={cn("flex w-full flex-col bg-white", embedded && "min-h-0 min-w-0 flex-1")}>
      {!embedded ? (
        helloPaneLayout ? (
          <div className="flex shrink-0 flex-col gap-1 px-5 py-4">
            <div className="flex min-w-0 items-center justify-between gap-3">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <button
                  type="button"
                  onClick={onBack}
                  className="flex size-9 shrink-0 items-center justify-center rounded-full text-[#5b5675] transition-colors hover:bg-[#f4f4f6] hover:text-[#36354c]"
                  aria-label="Back"
                >
                  <ArrowLeft className="size-5" aria-hidden />
                </button>
                <div className="min-w-0">
                  <h2 className="font-euclid text-[16px] font-medium leading-6 text-[#040222]">Edit Policy</h2>
                  {subtitle ? (
                    <p className="mt-0.5 font-euclid text-[14px] font-normal leading-5 text-[#5b5675]">{subtitle}</p>
                  ) : null}
                </div>
              </div>
              {headerTrailing ? (
                <div className="flex shrink-0 items-center">{headerTrailing}</div>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="flex shrink-0 flex-col gap-1 border-b border-[#e7e7f0] px-5 py-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onBack}
                className="flex size-9 shrink-0 items-center justify-center rounded-full text-[#5b5675] transition-colors hover:bg-[#f4f4f6] hover:text-[#36354c]"
                aria-label="Back"
              >
                <ArrowLeft className="size-5" aria-hidden />
              </button>
              <div className="min-w-0">
                <h2 className="font-euclid text-[16px] font-medium leading-6 text-[#040222]">Edit Policy</h2>
                {subtitle ? (
                  <p className="mt-0.5 font-euclid text-[14px] font-normal leading-5 text-[#5b5675]">{subtitle}</p>
                ) : null}
              </div>
            </div>
          </div>
        )
      ) : null}

      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 py-5",
          helloPaneLayout && "w-full min-w-0",
          embedded && "min-h-0 pt-4",
        )}
      >
        {helloPaneLayout ? (
          <div className="w-full min-w-0 overflow-hidden">{rowList}</div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-[#e7e7f0] bg-white shadow-[0px_1px_3px_rgba(54,53,76,0.06)]">
            <div className="border-b border-[#e7e7f0] px-5 py-4">
              <h3 className="font-euclid text-[16px] font-semibold leading-6 text-[#040222]">Update policy</h3>
              <p className="mt-1 font-euclid text-[13px] leading-5 text-[#5b5675]">
                {policy.type === "Health Insurance"
                  ? "Review insured details. Upload proof where the change must be verified before Advisor UI."
                  : "Review current values. Edits that affect the vehicle record require an RC upload before Advisor UI."}
              </p>
            </div>
            {rowList}
          </div>
        )}
      </div>
    </div>
  )
}
