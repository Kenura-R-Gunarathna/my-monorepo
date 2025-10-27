"use client"

import { useForm } from "@tanstack/react-form"
import { cn } from "../../lib/utils"
import { Button } from "../../components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "../../components/ui/field"
import { Input } from "../../components/ui/input"

interface SignupFormProps {
  className?: string
  onSubmit?: (data: {
    name: string
    email: string
    password: string
  }) => Promise<void> | void
}

export function SignupForm({
  className,
  onSubmit,
  ...props
}: SignupFormProps) {
  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    onSubmit: async ({ value }) => {
      if (onSubmit) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { confirmPassword, ...data } = value
        await onSubmit(data)
      }
    },
  })

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create your account</CardTitle>
          <CardDescription>
            Enter your email below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
          >
            <FieldGroup>
              <form.Field
                name="name"
                validators={{
                  onChange: ({ value }) =>
                    !value ? "Name is required" : undefined,
                }}
              >
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Full Name</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="text"
                      placeholder="John Doe"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      required
                    />
                    <FieldError>{field.state.meta.errors?.[0]}</FieldError>
                  </Field>
                )}
              </form.Field>

              <form.Field
                name="email"
                validators={{
                  onChange: ({ value }) =>
                    !value
                      ? "Email is required"
                      : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
                      ? "Invalid email address"
                      : undefined,
                }}
              >
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="email"
                      placeholder="m@example.com"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      required
                    />
                    <FieldError>{field.state.meta.errors?.[0]}</FieldError>
                  </Field>
                )}
              </form.Field>

              <Field>
                <Field className="grid grid-cols-2 gap-4">
                  <form.Field
                    name="password"
                    validators={{
                      onChange: ({ value }) =>
                        !value
                          ? "Password is required"
                          : value.length < 8
                          ? "Password must be at least 8 characters"
                          : undefined,
                    }}
                  >
                    {(field) => (
                      <Field>
                        <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          type="password"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          required
                        />
                        <FieldError>{field.state.meta.errors?.[0]}</FieldError>
                      </Field>
                    )}
                  </form.Field>

                  <form.Field
                    name="confirmPassword"
                    validators={{
                      onChangeListenTo: ["password"],
                      onChange: ({ value, fieldApi }) => {
                        const password = fieldApi.form.getFieldValue("password")
                        return !value
                          ? "Please confirm your password"
                          : value !== password
                          ? "Passwords do not match"
                          : undefined
                      },
                    }}
                  >
                    {(field) => (
                      <Field>
                        <FieldLabel htmlFor={field.name}>
                          Confirm Password
                        </FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          type="password"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          required
                        />
                        <FieldError>{field.state.meta.errors?.[0]}</FieldError>
                      </Field>
                    )}
                  </form.Field>
                </Field>
                <FieldDescription>
                  Must be at least 8 characters long.
                </FieldDescription>
              </Field>

              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
              >
                {([canSubmit, isSubmitting]) => (
                  <Field>
                    <Button
                      type="submit"
                      disabled={!canSubmit || isSubmitting}
                    >
                      {isSubmitting ? "Creating account..." : "Create Account"}
                    </Button>
                    <FieldDescription className="text-center">
                      Already have an account? <a href="/">Sign in</a>
                    </FieldDescription>
                  </Field>
                )}
              </form.Subscribe>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}
