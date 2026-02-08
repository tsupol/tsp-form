import "../styles/form.css";

interface FormErrorMessageProps {
  error?: {
    message?: string;
  };
  reserveSpace?: boolean;
}

export const FormErrorMessage = ({ error, reserveSpace = true }: FormErrorMessageProps) => {
  if (!error) {
    return reserveSpace ? <span className="form-error">&nbsp;</span> : null;
  }
  return <span className="form-error">{error.message}</span>;
};
