import clsx from 'clsx';
import { forwardRef, SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
    label,
    error,
    options,
    className,
    id,
    ...props
}, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
        <div className="w-full">
            {label && (
                <label htmlFor={selectId} className="label">
                    {label}
                </label>
            )}
            <select
                ref={ref}
                id={selectId}
                className={clsx(
                    'input appearance-none cursor-pointer',
                    'bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%236b7280%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M10%203a.75.75%200%2001.55.24l3.25%203.5a.75.75%200%2011-1.1%201.02L10%204.852%207.3%207.76a.75.75%200%2001-1.1-1.02l3.25-3.5A.75.75%200%200110%203zm-3.76%209.292a.75.75%200%20011.06.04l2.7%202.908l2.7-2.908a.75.75%200%20111.1%201.02l-3.25%203.5a.75.75%200%2001-1.1%200l-3.25-3.5a.75.75%200%2001.04-1.06z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E")] bg-no-repeat bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] pr-10',
                    error && 'input-error',
                    className
                )}
                {...props}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && (
                <p className="mt-1.5 text-sm text-error-500">{error}</p>
            )}
        </div>
    );
});

Select.displayName = 'Select';
