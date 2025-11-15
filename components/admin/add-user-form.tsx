"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"

import { logger } from "@/lib/logger"
const optionalPasswordSchema = z.preprocess(
  (value) => {
    if (typeof value === "string" && value.trim() === "") {
      return undefined
    }
    return value
  },
  z.string().min(6, { message: "Password must be at least 6 characters." }).optional()
);

const createUserSchema = z.object({
  username: z.string().min(2, { message: "Username must be at least 2 characters." }).max(50),
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }).optional().or(z.literal("")),
  role: z.enum(["ADMIN", "HELPER", "STUDENT", "GUEST"], { required_error: "Role is required." }),
  department: z.string().min(1, { message: "Department is required." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

const editUserSchema = z.object({
  username: z.string().min(2, { message: "Username must be at least 2 characters." }).max(50),
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }).optional().or(z.literal("")),
  role: z.enum(["ADMIN", "HELPER", "STUDENT", "GUEST"], { required_error: "Role is required." }),
  department: z.string().min(1, { message: "Department is required." }),
  password: optionalPasswordSchema,
});

type AddUserFormValues = z.infer<typeof editUserSchema>

interface AddUserFormProps {
  user?: any
  onSuccess: (newUser: any) => void
}

export function AddUserForm({ user, onSuccess }: AddUserFormProps) {
  const isEditMode = Boolean(user?.id)
  const form = useForm<AddUserFormValues>({
    resolver: zodResolver(isEditMode ? editUserSchema : createUserSchema),
    defaultValues: {
      username: user?.username || "",
      name: user?.name || "",
      email: user?.email || "",
      password: "",
      role: user?.role || "GUEST",
      department: user?.department || "",
    },
  });

  useEffect(() => {
    form.reset({
      username: user?.username || "",
      name: user?.name || "",
      email: user?.email || "",
      password: "",
      role: user?.role || "GUEST",
      department: user?.department || "",
    })
  }, [user, form])

  async function onSubmit(data: AddUserFormValues) {
    try {
      const cleanedEmail = data.email && data.email.trim() !== "" ? data.email.trim() : undefined
      const cleanedPassword = data.password && data.password.trim() !== "" ? data.password.trim() : undefined

      const createPayload = {
        username: data.username,
        name: data.name,
        email: cleanedEmail,
        password: cleanedPassword,
        role: data.role,
        department: data.department,
        isActive: true,
      }

      const updatePayload = {
        name: data.name,
        email: cleanedEmail,
        role: data.role,
        department: data.department,
      }

      const endpoint = isEditMode ? `/api/admin/users/${user?.id}` : '/api/admin/users'
      const method = isEditMode ? 'PATCH' : 'POST'
      const payload = isEditMode ? updatePayload : createPayload
      const filteredPayload = Object.fromEntries(
        Object.entries(payload).filter(([, value]) => value !== undefined)
      )

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filteredPayload),
      })

      const responseData = await response.json().catch(() => null)

      if (!response.ok) {
        const errorMessage = responseData && typeof responseData === 'object' && 'error' in responseData
          ? (responseData as { error?: string }).error
          : undefined
        throw new Error(errorMessage || (isEditMode ? 'Failed to update user' : 'Failed to create user'))
      }

      toast({ title: isEditMode ? 'User updated successfully!' : 'User created successfully!' })
      if (!isEditMode) {
        form.reset({
          username: '',
          name: '',
          email: '',
          password: '',
          role: 'GUEST',
          department: '',
        })
      }
      onSuccess(responseData)
    } catch (error) {
      logger.error('Error creating user:', error);
      const errorMessage = error instanceof Error ? error.message : 'Please try again.';
      toast({
        title: isEditMode ? 'Error updating user' : 'Error creating user',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="e.g. johndoe" autoComplete="username" readOnly={isEditMode} {...field} />
              </FormControl>
              <FormDescription>Unique username for login</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. John Doe" autoComplete="name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g. john.doe@school.edu" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Enter password (min 6 characters)" autoComplete="new-password" {...field} />
              </FormControl>
              <FormDescription>Initial password for the user</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="HELPER">Helper</SelectItem>
                  <SelectItem value="STUDENT">Student</SelectItem>
                  <SelectItem value="GUEST">Guest</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="department"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department</FormLabel>
              <FormControl>
                <Input placeholder="e.g. IT Support" autoComplete="organization-title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting
            ? isEditMode ? 'Saving...' : 'Creating...'
            : isEditMode ? 'Save Changes' : 'Create User'}
        </Button>
      </form>
    </Form>
  )
}
