"use client"

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
const addUserSchema = z.object({
  username: z.string().min(2, { message: "Username must be at least 2 characters." }).max(50),
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }).optional().or(z.literal('')),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  role: z.enum(["ADMIN", "HELPER", "GUEST"], { required_error: "Role is required." }),
  department: z.string().min(1, { message: "Department is required." }),
});

type AddUserFormValues = z.infer<typeof addUserSchema>

interface AddUserFormProps {
  onSuccess: (newUser: any) => void
}

export function AddUserForm({ onSuccess }: AddUserFormProps) {
  const form = useForm<AddUserFormValues>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      username: "",
      name: "",
      email: "",
      password: "",
      role: "GUEST",
      department: "",
    },
  });

  async function onSubmit(data: AddUserFormValues) {
    try {
      // Clean email field - convert empty string to undefined
      const cleanedData = {
        ...data,
        email: data.email && data.email.trim() !== '' ? data.email : undefined,
        isActive: true
      };
      
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to create user' }));
        throw new Error(errorData.error || 'Failed to create user');
      }

      const newUser = await response.json();
      toast({ title: "User created successfully!" });
      form.reset();
      onSuccess(newUser);
    } catch (error) {
      logger.error('Error creating user:', error);
      const errorMessage = error instanceof Error ? error.message : 'Please try again.';
      toast({ title: "Error creating user", description: errorMessage, variant: "destructive" });
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
                <Input placeholder="e.g. johndoe" autoComplete="username" {...field} />
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
          {form.formState.isSubmitting ? "Creating..." : "Create User"}
        </Button>
      </form>
    </Form>
  )
}
