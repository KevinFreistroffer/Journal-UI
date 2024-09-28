import React, { createContext, useContext, ReactNode } from "react";
import {
  useForm as useHookForm,
  UseFormReturn,
  FieldValues,
  FieldPath,
} from "react-hook-form";

// Create a context for the form
const FormContext = createContext<UseFormReturn | null>(null);

export function useFormContext() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("useFormContext must be used within a FormProvider");
  }
  return context;
}

export const Form = ({
  children,
  ...props
}: { children: ReactNode } & Parameters<typeof useHookForm>[0]) => {
  const form = useHookForm(props);
  return <FormContext.Provider value={form}>{children}</FormContext.Provider>;
};

export const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  ...props
}: {
  name: TName;
} & Omit<React.ComponentPropsWithoutRef<"div">, "name">) => {
  const { register } = useFormContext();
  return <div {...props} {...register(name)} />;
};

export const FormItem = (props: React.ComponentPropsWithoutRef<"div">) => {
  return <div {...props} className="mb-4" />;
};

export const FormLabel = (props: React.ComponentPropsWithoutRef<"label">) => {
  return (
    <label
      {...props}
      className="block mb-2 text-sm font-medium text-gray-900"
    />
  );
};

export const FormControl = (props: React.ComponentPropsWithoutRef<"div">) => {
  return <div {...props} className="mt-1" />;
};

export const FormDescription = (props: React.ComponentPropsWithoutRef<"p">) => {
  return <p {...props} className="mt-2 text-sm text-gray-500" />;
};

export const FormMessage = ({
  name,
  ...props
}: { name: string } & React.ComponentPropsWithoutRef<"p">) => {
  const {
    formState: { errors },
  } = useFormContext();
  if (!errors[name]) return null;
  return (
    <p {...props} className="mt-2 text-sm text-red-600">
      {errors[name]?.message as string}
    </p>
  );
};

export const Label = FormLabel;
