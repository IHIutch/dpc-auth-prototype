import * as React from 'react'

interface DPCData {
  publicKey: string
  privateKey: string
  publicKeySignature: string
  jwt: string
  publicKeyId: string
  accessToken: string
}

interface DPCActions {
  setData: React.Dispatch<React.SetStateAction<DPCData>>
}

type DPCContextValue = DPCData & DPCActions

const DPCContext = React.createContext<DPCContextValue | null>(null)

const initialData: DPCData = {
  publicKey: '',
  privateKey: '',
  publicKeySignature: '',
  jwt: '',
  publicKeyId: '',
  accessToken: '',
}

export function DPCProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = React.useState<DPCData>(initialData)

  const contextValue = React.useMemo(() => ({
    ...data,
    setData,
  }), [data])

  return (
    <DPCContext.Provider value={contextValue}>
      {children}
    </DPCContext.Provider>
  )
}

export function useDPC() {
  const context = React.useContext(DPCContext)
  if (!context) {
    throw new Error('useDPC must be used within a DPCProvider')
  }
  return context
}

