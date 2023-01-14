interface Message {
    type: string;
    content: any;
}

interface ErrorMessage extends Message {
    error_code: number;
    error: string;
}