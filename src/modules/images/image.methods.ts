import sharp from 'sharp'
import type { imageFormat } from '../../utils/constants'

type ImageTransform = {
	input: Buffer | ArrayBuffer | Uint8Array
	format: (typeof imageFormat)[number]
	quality?: number
	lossless?: boolean
	resize?: {
		width?: number
		height?: number
		object_fit?: 'cover' | 'contain'
		object_position?: 'top' | 'bottom' | 'left' | 'right' | 'center'
	}
}

// TODO: validate function payload with zod

export const transformImage = async (payload: ImageTransform) => {
	try {
		const image = sharp(payload.input)
			.toFormat(payload.format, {
				quality: payload.quality ?? 80,
				...(payload.lossless ? { lossless: payload.lossless } : {}),
			})
			.resize({
				width: payload.resize?.width,
				height: payload.resize?.height,
				fit: payload.resize?.object_fit,
				position: payload.resize?.object_position,
			})

		/**
		 * Gets metadata of uncompressed/unconverted image
		 **/
		const metadata = await image.metadata()
		const { data, info } = await image.toBuffer({ resolveWithObject: true })
		const imageBase64 = `data:image/${info.format};base64,${data.toString('base64')}`

		return {
			image: imageBase64,
			new_metadata: {
				width: info.width,
				height: info.height,
				size: info.size,
				format: info.format,
			},
			old_metadata: {
				width: metadata.width,
				height: metadata.height,
				size: metadata.size,
				format: metadata.format,
			},
		}
	} catch (error) {
		if (error instanceof Error) {
			console.log('Error transforming image', error)
		}
	}
}
