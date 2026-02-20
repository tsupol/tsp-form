import "../styles/form.css";

interface FormErrorMessageProps {
  error?: {
    message?: string;
  };
}

export const FormErrorMessage = ({ error }: FormErrorMessageProps) => {
  if (!error?.message) return null;
  return <span className="form-error">{error.message}</span>;
};
