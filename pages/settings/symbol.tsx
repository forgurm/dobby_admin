import React, { useState, useEffect, useRef } from 'react';

interface Symbol {
  symbol_name: string | null;
  symbol_code: string;
  exchange_name: string;
}

interface ExchangeInfo {
  exchange_name: string;
  exchange_code: string;
  total_symbols: number;
  empty_symbol_names: number;
}

export default function SymbolSettings() {
  const [symbols, setSymbols] = useState<Symbol[]>([]);
  const [selectedExchange, setSelectedExchange] = useState<string>('');
  const [exchanges, setExchanges] = useState<ExchangeInfo[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const fetchExchanges = async () => {
      try {
        const response = await fetch('/api/exchanges');
        if (!response.ok) throw new Error('Failed to fetch exchanges');
        const data = await response.json();
        setExchanges(data);
        if (data.length > 0) {
          setSelectedExchange(data[0].exchange_code);
        }
      } catch (error) {
        console.error('Error fetching exchanges:', error);
      }
    };

    fetchExchanges();
  }, []);

  useEffect(() => {
    if (selectedExchange) {
      const fetchSymbols = async () => {
        try {
          const response = await fetch(`/api/symbols?exchange=${selectedExchange}`);
          if (!response.ok) throw new Error('Failed to fetch symbols');
          const data = await response.json();
          setSymbols(data);
        } catch (error) {
          console.error('Error fetching symbols:', error);
        }
      };

      fetchSymbols();
    }
  }, [selectedExchange]);

  const handleSymbolNameChange = (index: number, newName: string) => {
    const updatedSymbols = [...symbols];
    updatedSymbols[index].symbol_name = newName;
    setSymbols(updatedSymbols);
  };

  const handleSaveSymbols = async () => {
    try {
      const response = await fetch('/api/symbols', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symbols, exchange_code: selectedExchange }),
      });

      if (!response.ok) throw new Error('Failed to save symbols');

      // 저장 후 화면 새로고침
      window.location.reload();
    } catch (error) {
      console.error('Error saving symbols:', error);
    }
  };

  const scrollLeft = () => {
    if (scrollRef.current && buttonRef.current) {
      const buttonWidth = buttonRef.current.offsetWidth;
      scrollRef.current.scrollBy({ left: -buttonWidth, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current && buttonRef.current) {
      const buttonWidth = buttonRef.current.offsetWidth;
      scrollRef.current.scrollBy({ left: buttonWidth, behavior: 'smooth' });
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">심볼 설정</h1>
      <div className="flex items-center mb-4">
        <button onClick={scrollLeft} className="mr-2 bg-gray-300 p-2 rounded">◀</button>
        <div
          className="flex space-x-4 overflow-x-auto"
          ref={scrollRef}
          style={{
            whiteSpace: 'nowrap',
            scrollbarWidth: 'none', // Firefox
            msOverflowStyle: 'none', // IE 10+
          }}
        >
          {exchanges.map((exchange, index) => (
            <button
              key={index}
              ref={index === 0 ? buttonRef : null} // 첫 번째 버튼의 너비를 참조
              onClick={() => setSelectedExchange(exchange.exchange_code)}
              className={`px-4 py-2 rounded ${
                selectedExchange === exchange.exchange_code ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              {exchange.exchange_name} ( {exchange.empty_symbol_names}/ {exchange.total_symbols} )
            </button>
          ))}
        </div>
        <button onClick={scrollRight} className="ml-2 bg-gray-300 p-2 rounded">▶</button>
      </div>

      <button
        onClick={handleSaveSymbols}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4 w-full" // 너비를 100%로 설정
      >
        저장
      </button>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">심볼 목록</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-1/6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">번호</th>
                <th className="w-1/6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ">심볼 코드</th>
                <th className="w-4/6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">심볼 이름</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {symbols.map((symbol, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-medium">{index + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-medium bg-gray-100">
                    <span className="block overflow-hidden overflow-ellipsis" style={{ maxWidth: '100px' }}>
                        {symbol.symbol_code.replace('USDT', '')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-medium">
                    <input
                      type="text"
                      value={symbol.symbol_name || ''}
                      onChange={(e) => handleSymbolNameChange(index, e.target.value)}
                      className="mt-1 block w-full border rounded-md shadow-sm p-2"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 