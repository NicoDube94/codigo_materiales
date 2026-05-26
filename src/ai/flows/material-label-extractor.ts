'use server';
/**
 * @fileOverview Extracts material code and description from a photo of a material label.
 *
 * - extractMaterialLabel - A function that handles the material label extraction process.
 * - MaterialLabelExtractorInput - The input type for the extractMaterialLabel function.
 * - MaterialLabelExtractorOutput - The return type for the extractMaterialLabel function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MaterialLabelExtractorInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a material label, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type MaterialLabelExtractorInput = z.infer<typeof MaterialLabelExtractorInputSchema>;

const MaterialLabelExtractorOutputSchema = z.object({
  materialCode: z.string().describe('The identified material code (e.g., 76H02105).'),
  materialDescription: z.string().describe('The identified description of the material (e.g., etiqueta de eficiencia energía).'),
});
export type MaterialLabelExtractorOutput = z.infer<typeof MaterialLabelExtractorOutputSchema>;

export async function extractMaterialLabel(input: MaterialLabelExtractorInput): Promise<MaterialLabelExtractorOutput> {
  return materialLabelExtractorFlow(input);
}

const materialLabelExtractorPrompt = ai.definePrompt({
  name: 'materialLabelExtractorPrompt',
  input: {schema: MaterialLabelExtractorInputSchema},
  output: {schema: MaterialLabelExtractorOutputSchema},
  prompt: `You are an expert at parsing industrial product and material labels.\n  Your task is to identify and extract specific details from a photo of a material label.\n  \n  Please provide the identified material code and its description.\n  \n  A material code is typically an alphanumeric string, such as '76H02105'.\n  A material description is a phrase describing the material, such as 'etiqueta de eficiencia energía'.\n  \n  Photo of the material label: {{media url=photoDataUri}}`,
});

const materialLabelExtractorFlow = ai.defineFlow(
  {
    name: 'materialLabelExtractorFlow',
    inputSchema: MaterialLabelExtractorInputSchema,
    outputSchema: MaterialLabelExtractorOutputSchema,
  },
  async (input) => {
    const {output} = await materialLabelExtractorPrompt(input);
    return output!;
  }
);
