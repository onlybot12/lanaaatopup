import { Carousel } from "@/components/carousel"
import Image from "next/image"
import Link from "next/link"
import { Flame } from "lucide-react"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { WelcomeBox } from "@/components/welcome-box"
import { FirstVisitPopup } from "@/components/first-visit-popup"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getProducts, getCategories, getTypes, getWebsiteSettings } from "@/lib/db"
import { Navbar } from "@/components/navbar"
import { SiteFooter } from "@/components/site-footer"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function Home() {
  const [products, categories, types, settings] = await Promise.all([
    getProducts(),
    getCategories(),
    getTypes(),
    getWebsiteSettings(),
  ])

  const popularCategories = categories.filter((category) => category.popular)

  return (
    <>
      <Navbar />
      <main className="container py-6">
        <FirstVisitPopup />

        {settings && settings.slides && settings.slides.length > 0 && (
          <Carousel slides={settings.slides.filter((slide) => slide.active)} />
        )}

        <WelcomeBox className="mt-12 mb-8" />

        {popularCategories.length > 0 && (
          <section className="mb-8 slide-in">
            <div className="flex items-center gap-2 mb-4">
              <Flame className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Populer</h2>
            </div>
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex w-full gap-4">
                {popularCategories.map((category) => {
                  const categoryProducts = products.filter((p) => p.category === category.id)
                  const firstProduct = categoryProducts[0]

                  return (
                    <div
                      key={category._id?.toString()}
                      className="relative flex-none w-[280px] group rounded-lg overflow-hidden bg-secondary/50 hover:bg-secondary/80 transition-colors"
                    >
                      <Link href={`/beli/${category.id}`} className="block p-4">
                        <div className="flex items-center gap-4">
                          <Image
                            src={category.image || firstProduct?.image || "/placeholder.svg"}
                            alt={category.name}
                            width={50}
                            height={50}
                            className="rounded-lg"
                          />
                          <div>
                            <h3 className="font-semibold text-sm">{category.name}</h3>
                            <p className="text-xs text-muted-foreground">{category.publisher}</p>
                          </div>
                        </div>
                      </Link>
                    </div>
                  )
                })}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </section>
        )}

        <section className="slide-in" style={{ animationDelay: "0.2s" }}>
          {types.length > 0 ? (
            <Tabs defaultValue={types.length > 0 ? types[0].id : "games"}>
              <ScrollArea className="w-full pb-4">
                <TabsList className="inline-flex h-10 w-auto">
                  {types.map((type) => (
                    <TabsTrigger key={type.id} value={type.id} className="rounded-full text-xs">
                      {type.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>

              {types.map((type) => (
                <TabsContent key={type.id} value={type.id} className="mt-4">
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {categories
                      .filter((category) => category.typeId === type.id)
                      .map((category) => {
                        const categoryProducts = products.filter((product) => product.category === category.id)
                        const firstProduct = categoryProducts[0]

                        return firstProduct || category.image ? (
                          <Link
                            key={category.id}
                            href={`/beli/${category.id}`}
                            className="aspect-square relative rounded-lg overflow-hidden group"
                          >
                            <Image
                              src={category.image || firstProduct?.image || "/placeholder.svg"}
                              alt={category.name}
                              fill
                              className="object-cover transition-transform group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-2">
                              <span className="text-white text-sm font-medium">{category.name}</span>
                            </div>
                          </Link>
                        ) : null
                      })}
                    {categories.filter((category) => category.typeId === type.id).length === 0 && (
                      <div className="col-span-full text-center py-12">
                        <p className="text-muted-foreground">Belum ada kategori dalam tipe ini</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Belum ada tipe produk yang tersedia</p>
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  )
}

