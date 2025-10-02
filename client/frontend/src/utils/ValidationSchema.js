import * as Yup from "yup";

const today = new Date();
const minAdultDate = new Date(
    today.getFullYear() - 18,
    today.getMonth(),
    today.getDate()
);


export const schema = Yup.object({
    email: Yup.string().
        email("Invalid email")
        .matches(
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            "Email must be a valid email address"
        ).
        required("Email is required"),
    password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
    name: Yup.string()
        .min(3, "Name must be at least 3 characters")
        .matches(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces")
        .required("Name is required"),
    dob: Yup.date()
        .max(minAdultDate, "You must be at least 18 years old")
        .required("Date of birth is required"),
});

export const profileSchema = Yup.object({
    email: Yup.string().
        email("Invalid email")
        .matches(
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            "Email must be a valid email address"
        ).
        required("Email is required"),
    name: Yup.string()
        .min(3, "Name must be at least 3 characters")
        .matches(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces")
        .required("Name is required"),
})

