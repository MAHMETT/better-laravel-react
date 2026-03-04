import InputError from "@/components/input-error";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import AppLayout from "@/layouts/app-layout";
import users from "@/routes/users";
import type { BreadcrumbItem } from "@/types";
import { Head, router } from "@inertiajs/react";
import { ArrowLeft, LoaderCircleIcon, UserPlus } from "lucide-react";
import { useEffect } from "react";
import { create } from "zustand";
import { toast } from "sonner";

const breadcrumbs: BreadcrumbItem[] = [
	{
		title: "Users",
		href: users.index.url(),
	},
	{
		title: "Create",
		href: users.create.url(),
	},
];

interface FormData {
	name: string;
	email: string;
	password: string;
	password_confirmation: string;
	role: "admin" | "user";
	status: "enable" | "disable";
}

interface CreateUserPageState {
	formData: FormData;
	validationErrors: Record<string, string>;
	processing: boolean;
	setFormData: (formData: FormData) => void;
	setValidationErrors: (validationErrors: Record<string, string>) => void;
	setProcessing: (processing: boolean) => void;
	reset: () => void;
}

const initialFormData: FormData = {
	name: "",
	email: "",
	password: "",
	password_confirmation: "",
	role: "user",
	status: "enable",
};

const useCreateUserPageStore = create<CreateUserPageState>((set) => ({
	formData: { ...initialFormData },
	validationErrors: {},
	processing: false,
	setFormData: (formData) => set({ formData }),
	setValidationErrors: (validationErrors) => set({ validationErrors }),
	setProcessing: (processing) => set({ processing }),
	reset: () =>
		set({
			formData: { ...initialFormData },
			validationErrors: {},
			processing: false,
		}),
}));

export default function CreateUser() {
	const formData = useCreateUserPageStore((state) => state.formData);
	const validationErrors = useCreateUserPageStore(
		(state) => state.validationErrors,
	);
	const processing = useCreateUserPageStore((state) => state.processing);
	const setFormData = useCreateUserPageStore((state) => state.setFormData);
	const setValidationErrors = useCreateUserPageStore(
		(state) => state.setValidationErrors,
	);
	const setProcessing = useCreateUserPageStore((state) => state.setProcessing);
	const resetStore = useCreateUserPageStore((state) => state.reset);

	useEffect(() => {
		resetStore();
	}, [resetStore]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setProcessing(true);

		// Clear previous errors
		setValidationErrors({});

		// Prepare data for submission
		const dataToSubmit = {
			name: formData.name.trim(),
			email: formData.email.trim(),
			password: formData.password,
			password_confirmation: formData.password_confirmation,
			role: formData.role || "user",
			status: formData.status || "enable",
		};

		// Simple client-side validation
		const errors: Record<string, string> = {};

		// Name validation
		if (!dataToSubmit.name || dataToSubmit.name.length < 2) {
			errors.name = "Name must be at least 2 characters";
		}

		// Email validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!dataToSubmit.email || !emailRegex.test(dataToSubmit.email)) {
			errors.email = "Please enter a valid email address";
		}

		// Password validation (only if provided)
		if (dataToSubmit.password && dataToSubmit.password.length > 0) {
			if (dataToSubmit.password.length < 8) {
				errors.password = "Password must be at least 8 characters";
			}
			if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(dataToSubmit.password)) {
				errors.password =
					"Password must contain uppercase, lowercase, and number";
			}
			if (dataToSubmit.password !== dataToSubmit.password_confirmation) {
				errors.password_confirmation = "Passwords must match";
			}
		}

		// If there are errors, show them
		if (Object.keys(errors).length > 0) {
			setValidationErrors(errors);
			toast.error("Please fix the validation errors");
			setProcessing(false);
			console.error("Validation errors:", errors);
			return;
		}

		const id = toast.loading("Creating user...");

		router.post(users.store.url(), dataToSubmit, {
			preserveScroll: true,
			onSuccess: () => {
				toast.success("User created successfully", { id });
				setFormData({ ...initialFormData });
				setValidationErrors({});
			},
			onError: (errors) => {
				setValidationErrors(errors);
				toast.error("Failed to create user", { id });
			},
			onFinish: () => {
				setProcessing(false);
			},
		});
	};

	const handleCancel = () => {
		router.visit(users.index.url());
	};

	return (
		<AppLayout breadcrumbs={breadcrumbs}>
			<Head title="Create User" />

			<div className="flex flex-1 flex-col gap-4 rounded-xl p-4">
				{/* Header */}
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-center gap-4">
						<Button
							variant="ghost"
							size="icon"
							onClick={handleCancel}
							className="h-10 w-10"
						>
							<ArrowLeft className="h-5 w-5" />
						</Button>
						<div>
							<h1 className="text-2xl font-semibold">Create User</h1>
							<p className="text-sm text-muted-foreground">
								Add a new user to the system
							</p>
						</div>
					</div>
				</div>

				{/* Form */}
				<Card>
					<CardHeader>
						<div className="flex items-center gap-2">
							<UserPlus className="h-5 w-5 text-muted-foreground" />
							<CardTitle>User Information</CardTitle>
						</div>
						<CardDescription>
							Fill in the details below to create a new user account
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-6">
							<div className="grid gap-4 sm:grid-cols-2">
								{/* Name */}
								<div className="space-y-2">
									<Label htmlFor="name">Full Name</Label>
									<Input
										id="name"
										value={formData.name}
										onChange={(e) =>
											setFormData({
												...formData,
												name: e.target.value,
											})
										}
										placeholder="John Doe"
										autoFocus
									/>
									<InputError message={validationErrors.name} />
								</div>

								{/* Email */}
								<div className="space-y-2">
									<Label htmlFor="email">Email Address</Label>
									<Input
										id="email"
										type="email"
										value={formData.email}
										onChange={(e) =>
											setFormData({
												...formData,
												email: e.target.value,
											})
										}
										placeholder="john@example.com"
									/>
									<InputError message={validationErrors.email} />
								</div>
							</div>

							<div className="grid gap-4 sm:grid-cols-2">
								{/* Password */}
								<div className="space-y-2">
									<Label htmlFor="password">Password</Label>
									<Input
										id="password"
										type="password"
										value={formData.password}
										onChange={(e) =>
											setFormData({
												...formData,
												password: e.target.value,
											})
										}
										placeholder="••••••••"
									/>
									<InputError message={validationErrors.password} />
									{!validationErrors.password && (
										<p className="text-xs text-muted-foreground">
											Must be at least 8 characters with uppercase, lowercase,
											and number
										</p>
									)}
								</div>

								{/* Password Confirmation */}
								<div className="space-y-2">
									<Label htmlFor="password_confirmation">
										Confirm Password
									</Label>
									<Input
										id="password_confirmation"
										type="password"
										value={formData.password_confirmation}
										onChange={(e) =>
											setFormData({
												...formData,
												password_confirmation: e.target.value,
											})
										}
										placeholder="••••••••"
									/>
									<InputError
										message={validationErrors.password_confirmation}
									/>
								</div>
							</div>

							<div className="grid gap-4 sm:grid-cols-2">
								{/* Role */}
								<div className="space-y-2">
									<Label htmlFor="role">Role</Label>
									<Select
										value={formData.role}
										onValueChange={(v: "admin" | "user") =>
											setFormData({
												...formData,
												role: v,
											})
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select role" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="user">User</SelectItem>
											<SelectItem value="admin">Admin</SelectItem>
										</SelectContent>
									</Select>
									<InputError message={validationErrors.role} />
								</div>

								{/* Status */}
								<div className="space-y-2">
									<Label htmlFor="status">Status</Label>
									<Select
										value={formData.status}
										onValueChange={(v: "enable" | "disable") =>
											setFormData({
												...formData,
												status: v,
											})
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select status" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="enable">Enabled</SelectItem>
											<SelectItem value="disable">Disabled</SelectItem>
										</SelectContent>
									</Select>
									<InputError message={validationErrors.status} />
								</div>
							</div>

							{/* Actions */}
							<div className="flex items-center gap-4 border-t pt-6">
								<Button type="submit" disabled={processing}>
									{processing ? (
										<>
											<LoaderCircleIcon className="size-4 animate-spin" />
											Creating...
										</>
									) : (
										<>
											<UserPlus className="mr-2 size-4" />
											Create User
										</>
									)}
								</Button>
								<Button
									type="button"
									variant="outline"
									onClick={handleCancel}
									disabled={processing}
								>
									Cancel
								</Button>
							</div>
						</form>
					</CardContent>
				</Card>
			</div>
		</AppLayout>
	);
}
