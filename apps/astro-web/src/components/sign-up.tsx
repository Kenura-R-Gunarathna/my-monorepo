"use client";

import { useForm } from "@tanstack/react-form";
import { signUpSchema, type SignUpInput } from "@krag/zod-schema";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
	Button,
	Input,
	Label,
} from "@krag/react-ui";
import { signUp, signIn } from "../lib/auth-client";

export function SignUpCard() {
	const form = useForm({
		defaultValues: {
			firstName: "",
			lastName: "",
			email: "",
			password: "",
			image: "",
		} as SignUpInput,
		validators: {
			onChange: signUpSchema,
		},
		onSubmit: async ({ value }) => {
			try {
				await signUp.email({
					name: `${value.firstName} ${value.lastName}`,
					image: value.image,
					email: value.email,
					password: value.password,
					callbackURL: "/dashboard",
					fetchOptions: {
						onError(context) {
							alert(context.error.message);
						},
						onSuccess() {
							window.location.href = "/dashboard";
						},
					},
				});
			} catch (error) {
				console.error("Sign up error:", error);
			}
		},
	});

	const convertImageToBase64 = async (file: File): Promise<string> => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => resolve(reader.result as string);
			reader.onerror = (error) => reject(error);
		});
	};

	const handleSocialSignIn = async (provider: "github" | "google") => {
		try {
			await signIn.social({
				provider,
				callbackURL: "/dashboard",
			});
		} catch (error) {
			console.error("Social sign in error:", error);
		}
	};

	return (
		<Card className="max-w-md w-full">
			<CardHeader>
				<CardTitle className="text-lg md:text-xl">Sign Up</CardTitle>
				<CardDescription className="text-xs md:text-sm">
					Enter your information to create an account
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
				>
					<div className="grid gap-4">
						<div className="flex items-center gap-2">
							<form.Field name="firstName">
								{(field) => (
									<div className="grid gap-2 w-full">
										<Label htmlFor={field.name}>First Name</Label>
										<Input
											id={field.name}
											type="text"
											placeholder="First Name"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
										/>
										{field.state.meta.errors.length > 0 && (
											<span className="text-sm text-destructive">
											{field.state.meta.errors[0]?.message}
											</span>
										)}
									</div>
								)}
							</form.Field>

							<form.Field name="lastName">
								{(field) => (
									<div className="grid gap-2 w-full">
										<Label htmlFor={field.name}>Last Name</Label>
										<Input
											id={field.name}
											type="text"
											placeholder="Last Name"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
										/>
										{field.state.meta.errors.length > 0 && (
											<span className="text-sm text-destructive">
												{field.state.meta.errors[0]?.message}
											</span>
										)}
									</div>
								)}
							</form.Field>
						</div>

						<form.Field name="email">
							{(field) => (
								<div className="grid gap-2">
									<Label htmlFor={field.name}>Email</Label>
									<Input
										id={field.name}
										type="email"
										placeholder="m@example.com"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
									{field.state.meta.errors.length > 0 && (
										<span className="text-sm text-destructive">
											{field.state.meta.errors[0]?.message}
										</span>
									)}
								</div>
							)}
						</form.Field>

						<form.Field name="password">
							{(field) => (
								<div className="grid gap-2">
									<Label htmlFor={field.name}>Password</Label>
									<Input
										id={field.name}
										type="password"
										placeholder="Password"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
									{field.state.meta.errors.length > 0 && (
										<span className="text-sm text-destructive">
											{field.state.meta.errors[0]?.message}
										</span>
									)}
								</div>
							)}
						</form.Field>

						<form.Field name="image">
							{(field) => (
								<div className="grid gap-2">
									<Label htmlFor={field.name}>Profile Image (Optional)</Label>
									<Input
										id={field.name}
										type="file"
										accept="image/*"
										onChange={async (e) => {
											const file = e.target.files?.[0];
											if (file) {
												const base64 = await convertImageToBase64(file);
												field.handleChange(base64);
											}
										}}
									/>
									{field.state.meta.errors.length > 0 && (
										<span className="text-sm text-destructive">
											{field.state.meta.errors[0]?.message}
										</span>
									)}
								</div>
							)}
						</form.Field>

						<form.Subscribe
							selector={(state) => [state.isSubmitting, state.canSubmit]}
						>
							{([isSubmitting, canSubmit]) => (
								<Button type="submit" disabled={!canSubmit || isSubmitting}>
									{isSubmitting ? "Creating account..." : "Sign Up"}
								</Button>
							)}
						</form.Subscribe>

						<Button
							type="button"
							className="gap-2"
							variant="outline"
							onClick={() => handleSocialSignIn("github")}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="1.2em"
								height="1.2em"
								viewBox="0 0 24 24"
							>
								<path
									fill="currentColor"
									d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"
								/>
							</svg>
							Continue with GitHub
						</Button>
						<Button
							type="button"
							className="gap-2"
							variant="outline"
							onClick={() => handleSocialSignIn("google")}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="1.2em"
								height="1.2em"
								viewBox="0 0 512 512"
							>
								<path
									fill="currentColor"
									d="m473.16 221.48l-2.26-9.59H262.46v88.22H387c-12.93 61.4-72.93 93.72-121.94 93.72c-35.66 0-73.25-15-98.13-39.11a140.08 140.08 0 0 1-41.8-98.88c0-37.16 16.7-74.33 41-98.78s61-38.13 97.49-38.13c41.79 0 71.74 22.19 82.94 32.31l62.69-62.36C390.86 72.72 340.34 32 261.6 32c-60.75 0-119 23.27-161.58 65.71C58 139.5 36.25 199.93 36.25 256s20.58 113.48 61.3 155.6c43.51 44.92 105.13 68.4 168.58 68.4c57.73 0 112.45-22.62 151.45-63.66c38.34-40.4 58.17-96.3 58.17-154.9c0-24.67-2.48-39.32-2.59-39.96"
								/>
							</svg>
							Continue with Google
						</Button>

						<p className="text-sm text-center">
							Already have an account?{" "}
							<a
								href="/sign-in"
								className="text-blue-600 dark:text-blue-400 underline"
							>
								Sign In
							</a>
						</p>
					</div>
				</form>
			</CardContent>
			<CardFooter className="flex-col">
				<div className="flex justify-center w-full border-t py-4">
					<p className="text-center text-xs text-neutral-500">
						Secured by{" "}
						<span className="text-orange-600 dark:text-orange-400">
							better-auth.
						</span>
					</p>
				</div>
			</CardFooter>
		</Card>
	);
}
