import { Button } from "@/components/ui/button"
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { SyntheticEvent } from "react";
import "./login-form.css";


interface LoginFormProps {
    email: string;
    password: string;
    onEmailChange: (val: string) => void;
    onPasswordChange: (val: string) => void;
    onLogin: (e: SyntheticEvent<HTMLFormElement>) => void;
}

export function LoginForm({
    email,
    password,
    onEmailChange,
    onPasswordChange,
    onLogin,
}: LoginFormProps) {
  return (
    <div className="login-form">
      <form onSubmit={onLogin}>
        <FieldSet className= "login-fieldset">
          <FieldLegend className = "login-legend">Login to your account</FieldLegend>
          <FieldDescription className = "login-description">
            Please login to your account using your credentials.
          </FieldDescription>

          <Field className="login-field">
            <FieldLabel>Email</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="abc@example.com"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              required
            />
          </Field>

          <Field className="login-field">
            <FieldLabel>Password</FieldLabel>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              required
            />
          </Field>

          <Field orientation="horizontal" className="login-field-button">
            <Button type="submit">Login</Button>
          </Field>
        </FieldSet>
      </form>
    </div>
  );
}