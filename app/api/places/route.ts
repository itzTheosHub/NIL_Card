import {NextResponse} from "next/server"


export async function GET(request: Request)
{
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query")
    const location = searchParams.get("location")

    const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": process.env.GOOGLE_PLACES_API_KEY ?? "",
            "X-Goog-FieldMask": "places.displayName,places.editorialSummary,places.googleMapsUri,places.businessStatus,places.photos,places.rating,places.userRatingCount,places.formattedAddress,places.websiteUri,places.primaryTypeDisplayName,places.nationalPhoneNumber,places.regularOpeningHours"
        },
        body: JSON.stringify({
            textQuery: `${query} in ${location}`
        })
    })

    const data = await response.json()
    const places = (data.places ?? []).map((place: any) => ({
        ...place,
        photoUrl: place.photos?.[0]?.name
        ? `https://places.googleapis.com/v1/${place.photos[0].name}/media?maxWidthPx=400&key=${process.env.GOOGLE_PLACES_API_KEY}`
        : null
    }))


    return NextResponse.json({places})


}