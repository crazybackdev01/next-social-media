import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { Button, ButtonProps } from "./ui/button";

interface LoadingButtonProps extends ButtonProps {
  loading: boolean;
}

export default function LoadingButton({
  loading,
  disabled,
  className,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      disabled={loading || disabled}
      className={cn("flex items-center gap-2", className)}
      {...props}
    >
      {loading && <Loader2 className="size-5 animate-spin" />}
      {props.children}
    </Button>
  );
}

// When we are using (...) operator in the function arguments then it is behaving like Spread operator where it is spreading all the remaining props in the destructuring bracket of the Button component
// When we are using (...) operator in the Component props then it is  also behaving like the Spread operator where it is spreading the props extended by the ButtonProps
// cn() function helps in overriding the already existing classes in the tailwind css because in the tailwind, order of classes matters, by default it does not overrides the already existing classes
// cn() function also helps in taking and setting the class names programmatically in the program by passing them as props
