import { EggMark } from "@/components/brand/Wordmark";

export default function Page() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-8 text-center">
      <span className="grid size-20 place-items-center rounded-full bg-canaa-50 text-canaa-300">
        <EggMark outline className="size-9" />
      </span>
      <h1 className="mt-5 font-display text-[20px] font-semibold text-ink">Você está sem conexão</h1>
      <p className="mt-2 max-w-[30ch] text-[14px] leading-relaxed text-ink-muted">
        Assim que a internet voltar, o aplicativo carrega normalmente e seu pedido continua salvo.
      </p>
    </main>
  );
}
