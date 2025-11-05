import * as React from "react"
import type { OTPInputProps } from "input-otp"

export const InputOTP: React.ForwardRefExoticComponent<
  OTPInputProps & React.RefAttributes<React.ElementRef<"div">>
>

export const InputOTPGroup: React.ForwardRefExoticComponent<
  React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>
>

export const InputOTPSlot: React.ForwardRefExoticComponent<
  React.HTMLAttributes<HTMLDivElement> & { index: number } & React.RefAttributes<HTMLDivElement>
>

export const InputOTPSeparator: React.ForwardRefExoticComponent<
  React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>
>
