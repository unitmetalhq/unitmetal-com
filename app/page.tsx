import TerminalMenu from "@/components/terminal-menu";
import KeyboardNav from "@/components/keyboard-nav";

export default function Home() {
  const menuItems = [
    {
      id: 1,
      name: 'Swap',
      url: '/swap'
    },
    {
      id: 2,
      name: 'Explore yield',
      url: '/explore'
    },
    {
      id: 3,
      name: 'Learn more about DeFi',
      url: '/learn'
    },
  ];

  const keyboardNavItems = [
    {
      keyboard: '1',
      description: 'Sections',
      url: '/swap'
    },
    {
      keyboard: '2',
      description: 'Sections',
      url: '/explore'
    },
    {
      keyboard: '3',
      description: 'Sections',
      url: '/learn'
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-0">
      <div className="flex flex-col gap-4 w-full md:w-5/6 text-left">
        <div className="flex flex-row gap-2 items-center">
          <span className="text-sm bg-primary text-secondary font-bold px-2 py-1">00.</span>
          <h1 className="text-md font-bold">Index</h1>
        </div>
        <h1 className="text-xl md:text-3xl font-bold">Professional Interface for DeFi</h1>
        <div className="flex flex-col gap-12 mt-4">
          <p className="text-md">High quality, open source, local first interface for DeFi users. Swap, provide liquidity and explore yield opportunities.</p>
        </div>
      </div>
      <div className="flex flex-col border-2 border-primary gap-2 pb-8">
        <div className="flex flex-row justify-between items-center bg-primary text-secondary p-2">
          <h1 className="text-lg md:text-xl font-bold">Terminal</h1>
          <p className="text-md">_</p>
        </div>
        <div className="flex flex-col px-4 py-2">
          <h2 className="text-md">$ navigate</h2>
          <TerminalMenu menuItems={menuItems} />
        </div>
      </div>
      <KeyboardNav keyboardNavItems={keyboardNavItems} />
    </div>
  );
}