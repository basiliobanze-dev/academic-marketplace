export default function AppLogo() {
    return (
        <>
            <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white">
                <img
                    src="/images/marketplace-logo.png"
                    alt="Logótipo do Instituto Superior Dom Bosco"
                    className="h-full w-full object-cover"
                />
            </div>

            <div className="ml-2 grid flex-1 text-left">
                <span className="truncate text-sm font-semibold leading-tight">
                    Marketplace Académico
                </span>

                <span className="truncate text-xs text-muted-foreground">
                    Instituto Superior Dom Bosco
                </span>
            </div>
        </>
    );
}