import * as React from "react"
import { cn } from "../../lib/cn"
import { Label } from "./label"
import { Input } from "./input"

// TextFieldRoot is a wrapper for the text field group
function TextFieldRoot({ 
  className, 
  ...props 
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col gap-1.5", className)}
      {...props}
    />
  )
}

// TextFieldLabel is an alias for Label with htmlFor support
function TextFieldLabel({ 
  className,
  htmlFor,
  ...props 
}: React.ComponentProps<typeof Label> & { htmlFor?: string }) {
  return (
    <Label
      htmlFor={htmlFor}
      className={className}
      {...props}
    />
  )
}

// TextField is an alias for Input
const TextField = Input

export { TextField, TextFieldLabel, TextFieldRoot }
